#!/bin/bash

echo "========================================"
echo "   LUXANDA - Marketplace Africaine"
echo "========================================"
echo

echo "Démarrage du backend..."
cd backend && npm run dev &
BACKEND_PID=$!

echo
echo "Attente de 3 secondes..."
sleep 3

echo
echo "Démarrage du frontend..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo
echo "========================================"
echo "Application démarrée !"
echo
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo "========================================"
echo

# Attendre que l'utilisateur appuie sur Ctrl+C
trap "echo 'Arrêt de l\'application...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
