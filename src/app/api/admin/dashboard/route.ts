import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    try {
        const cookieStore = cookies()
        const supabase = createClient(cookieStore)

        // Check authentication
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        // Check admin role
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single() as any

        if (profile?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
        }

        // Users stats
        const totalUsers = await prisma.user.count()
        const activeUsers = await prisma.user.count({
            where: { profile: { isNot: null } }
        })
        const vendors = await prisma.user.count({
            where: { role: 'VENDOR' }
        })

        // Products stats
        const totalProducts = await prisma.product.count()
        const activeProducts = await prisma.product.count({
            where: { status: 'ACTIVE' }
        })
        const featuredProducts = await prisma.product.count({
            where: { featured: true }
        })

        // Subscriptions stats
        const totalSubscriptions = await prisma.subscription.count()
        const activeSubscriptions = await prisma.subscription.count({
            where: { status: 'ACTIVE' }
        })
        const pendingSubscriptions = await prisma.subscription.count({
            where: { status: 'PENDING' }
        })

        // Revenue stats
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const totalRevenue = await prisma.subscription.aggregate({
            _sum: {
                amount: true
            },
            where: {
                status: 'ACTIVE',
                startDate: {
                    gte: thirtyDaysAgo
                }
            }
        })

        // Recent activities
        const recentUsers = await prisma.user.findMany({
            select: {
                profile: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                },
                email: true,
                role: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        })

        const recentProducts = await prisma.product.findMany({
            select: {
                name: true,
                price: true,
                vendor: {
                    select: {
                        user: {
                            select: {
                                profile: {
                                    select: {
                                        firstName: true,
                                        lastName: true
                                    }
                                }
                            }
                        }
                    }
                },
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        })

        const recentSubscriptions = await prisma.subscription.findMany({
            select: {
                plan: true,
                amount: true,
                status: true,
                user: {
                    select: {
                        profile: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        })

        return NextResponse.json({
            stats: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    vendors: vendors
                },
                products: {
                    total: totalProducts,
                    active: activeProducts,
                    featured: featuredProducts
                },
                subscriptions: {
                    total: totalSubscriptions,
                    active: activeSubscriptions,
                    pending: pendingSubscriptions
                },
                revenue: {
                    thisMonth: totalRevenue._sum.amount || 0
                }
            },
            recentActivities: {
                users: recentUsers.map((user: any) => ({
                    firstName: user.profile?.firstName,
                    lastName: user.profile?.lastName,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt
                })),
                products: recentProducts.map((product: any) => ({
                    name: product.name,
                    price: product.price,
                    firstName: product.vendor?.user?.profile?.firstName,
                    lastName: product.vendor?.user?.profile?.lastName,
                    createdAt: product.createdAt
                })),
                subscriptions: recentSubscriptions.map((sub: any) => ({
                    plan: sub.plan,
                    amount: sub.amount,
                    status: sub.status,
                    firstName: sub.user?.profile?.firstName,
                    lastName: sub.user?.profile?.lastName,
                    createdAt: sub.createdAt
                }))
            }
        })

    } catch (error) {
        console.error('Admin dashboard error:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des statistiques' },
            { status: 500 }
        )
    }
}
