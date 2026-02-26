import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$connect()

    // Test basic queries
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()
    const categoryCount = await prisma.category.count()

    // Create a test user if none exists
    let testUser = await prisma.user.findFirst()
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'temp_hashed_password', // Should be properly hashed in reality
          role: 'USER'
        }
      })
    }

    // Create a test category if none exists
    let testCategory = await prisma.category.findFirst()
    if (!testCategory) {
      testCategory = await prisma.category.create({
        data: {
          name: 'Test Category',
          description: 'A test category for database testing'
        }
      })
    }

    // Create a test product if none exists
    let testProduct = await prisma.product.findFirst()
    if (!testProduct) {
      testProduct = await prisma.product.create({
        data: {
          name: 'Test Product',
          description: 'A test product for database testing',
          price: 29.99,
          quantity: 100,
          vendorId: testUser.id,
          categoryId: testCategory.id,
          status: 'ACTIVE'
        }
      })
    }

    // Test relationships
    const productWithRelations = await prisma.product.findFirst({
      include: {
        vendor: true,
        category: true,
        reviews: true,
        variants: true
      }
    })

    // Note: Don't disconnect in serverless environment (Vercel)
    // Prisma manages connections automatically in serverless

    return NextResponse.json({
      success: true,
      message: 'Database connection and operations successful!',
      data: {
        userCount,
        productCount,
        categoryCount,
        testUser: {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name,
          role: testUser.role
        },
        testCategory: {
          id: testCategory.id,
          name: testCategory.name,
          description: testCategory.description
        },
        testProduct: {
          id: testProduct.id,
          name: testProduct.name,
          price: testProduct.price,
          quantity: testProduct.quantity,
          status: testProduct.status
        },
        productWithRelations: productWithRelations ? {
          id: productWithRelations.id,
          name: productWithRelations.name,
          vendor: {
            id: productWithRelations.vendor.id,
            storeName: productWithRelations.vendor.storeName
          },
          category: {
            id: productWithRelations.category.id,
            name: productWithRelations.category.name
          },
          reviewsCount: productWithRelations.reviews.length,
          variantsCount: productWithRelations.variants.length
        } : null
      }
    })

  } catch (error) {
    console.error('Database test error:', error)
    // Note: Don't disconnect in serverless environment (Vercel)
    // Prisma manages connections automatically in serverless

    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
