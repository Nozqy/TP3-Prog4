# Sistema de Gestión de Transporte - TP3

Trabajo Práctico N° 3 correspondiente a la materia **Programación IV** de la **Tecnicatura Universitaria en Programación (UTN - Facultad Regional La Rioja)**.

## 👤 Datos del Alumno
* **Nombre y Apellido:** Bruno Nahuel González Romero
* **Carrera:** Tecnicatura Universitaria en Programación (TUP) - UTN FRLR
* **Asignatura:** Programación IV
* **Año:** 2026

---

## Descripción del Proyecto
Aplicación web Full-Stack para la administración de una empresa de transporte. Permite gestionar el registro de usuarios con autenticación segura y realizar operaciones CRUD completas sobre **vehículos**, **conductores** y **viajes**, incluyendo filtros combinados e indicadores de kilómetros acumulados.

### Tecnologías utilizadas
* **Backend:** Node.js, Express, MySQL (`mysql2/promise`), autenticación con JWT (`jsonwebtoken` y `passport-jwt`), encriptación de contraseñas con `bcrypt` y validaciones con `express-validator`.
* **Frontend:** React (Vite), `react-router-dom` para el manejo de rutas públicas y protegidas, y Context API (`AuthContext`) para la persistencia de sesión.
* **Base de Datos:** MySQL relacional con integridad referencial entre vehículos, conductores y viajes.