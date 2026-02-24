// Cargar variable de entorno
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
// const autenticacionMiddleware = require('./middleware/autenticacion_middleware');

// Configuración del servidor y de la base de datos
const app = express();
app.use(express.json());// permite al servidor leer datos en formato JSON
app.use(cors()); // permite solicitudes desde cualquier origen

// Esto hara que los archivos dentro de la carpeta "public" sean accesibles desde el navegador
const path = require('path');
// Servir los archivos estáticos del frontend (ajustado a la estructura del repo)
const frontendDir = path.join(__dirname, '..', '..', 'frontend');
app.use(express.static(frontendDir));

// Servir index por defecto
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendDir, 'index.html'));
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

// Endpoint de registro de usuario
// Registro de usuario (espera: nombre, apellido, email, password)
app.post('/registrar', async (req, res) => {
    try {
        const { nombre, apellido, email, password } = req.body;

        if (!email || !password || !nombre) {
            return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos.' });
        }

        // Verificar si el email ya existe
        const { data: existing, error: errEx } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', email)
            .limit(1)
            .maybeSingle();

        if (errEx) {
            console.error('Error comprobando usuario existente:', errEx);
            return res.status(500).json({ error: 'Error del servidor al verificar usuario.' });
        }

        if (existing) {
            return res.status(409).json({ error: 'El email ya está registrado.' });
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data, error } = await supabase
            .from('usuarios')
            .insert([{ nombre, apellido, email, password: hashedPassword }]);

        if (error) {
            console.error('Error durante el registro:', error);
            return res.status(500).json({ error: 'El registro de usuario falló.' });
        }

        res.status(201).json({ message: 'Usuario registrado correctamente.' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Endpoint de login de usuarios
// Login (espera: email, password)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
        }

        const { data: user, error } = await supabase
            .from('usuarios')
            .select('id, nombre, apellido, password')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(400).json({ error: 'Credenciales inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Credenciales inválidas.' });
        }

        const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Inicio de sesión exitoso!', token, nombre: user.nombre, apellido: user.apellido });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// console.log(autenticacionMiddleware);
