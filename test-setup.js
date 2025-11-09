const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧪 Test de configuration LUXANDA...\n')

// Vérifier les fichiers essentiels
const essentialFiles = [
  'package.json',
  'backend/package.json',
  'src/app/layout.tsx',
  'backend/src/index.ts',
  '.env.example'
]

console.log('📁 Vérification des fichiers essentiels...')
essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - MANQUANT`)
  }
})

// Vérifier la structure des dossiers
const essentialDirs = [
  'src/app',
  'src/components',
  'src/types',
  'backend/src/routes',
  'backend/src/middlewares',
  'public/images'
]

console.log('\n📂 Vérification des dossiers...')
essentialDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}`)
  } else {
    console.log(`❌ ${dir} - MANQUANT`)
  }
})

// Vérifier les dépendances
console.log('\n📦 Vérification des dépendances...')

// Frontend
if (fs.existsSync('package.json')) {
  const frontendPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const frontendDeps = Object.keys(frontendPkg.dependencies || {})
  const requiredFrontendDeps = ['next', 'react', 'typescript', 'tailwindcss']
  
  requiredFrontendDeps.forEach(dep => {
    if (frontendDeps.includes(dep)) {
      console.log(`✅ Frontend: ${dep}`)
    } else {
      console.log(`❌ Frontend: ${dep} - MANQUANT`)
    }
  })
}

// Backend
if (fs.existsSync('backend/package.json')) {
  const backendPkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'))
  const backendDeps = Object.keys(backendPkg.dependencies || {})
  const requiredBackendDeps = ['express', 'mysql2', 'jsonwebtoken', 'bcryptjs']
  
  requiredBackendDeps.forEach(dep => {
    if (backendDeps.includes(dep)) {
      console.log(`✅ Backend: ${dep}`)
    } else {
      console.log(`❌ Backend: ${dep} - MANQUANT`)
    }
  })
}

console.log('\n🚀 Configuration terminée !')
console.log('\n📋 Prochaines étapes :')
console.log('1. Copier env.example vers .env')
console.log('2. Configurer la base de données MySQL')
console.log('3. Installer les dépendances : npm install && cd backend && npm install')
console.log('4. Démarrer l\'application : start-dev.bat')
console.log('\n🔗 URLs :')
console.log('- Frontend: http://localhost:3000')
console.log('- Backend: http://localhost:5000')
console.log('- Admin: http://localhost:3000/admin')
console.log('\n🔑 Comptes de test :')
console.log('- Admin: admin@luxanda.bj / Momadmin@')
console.log('- Vendeur: vendeur@luxanda.bj / vendeur123')
console.log('- Acheteur: acheteur@luxanda.bj / acheteur123')

