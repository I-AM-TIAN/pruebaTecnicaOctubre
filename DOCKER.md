# 🐳 Docker Commands

## Iniciar la base de datos
```bash
docker-compose up -d
```

## Ver logs de la base de datos
```bash
docker-compose logs -f postgres
```

## Detener la base de datos
```bash
docker-compose down
```

## Detener y eliminar volúmenes (⚠️ elimina todos los datos)
```bash
docker-compose down -v
```

## Verificar estado del contenedor
```bash
docker-compose ps
```

## Conectarse a la base de datos
```bash
docker exec -it backend-prueba-postgres psql -U postgres -d prueba_tecnica
```
