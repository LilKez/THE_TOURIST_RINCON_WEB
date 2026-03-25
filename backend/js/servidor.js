// Cargar variables de entorno
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// ======================
// FRONTEND
// ======================
const frontendDir = path.join(__dirname, '..', '..', 'frontend');

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendDir, 'index.html'));
});

app.use(express.static(frontendDir));

// SERVIR IMÁGENES
const imgDir = path.join(__dirname, '..', '..', 'frontend', 'img');
app.use('/img', express.static(imgDir));

// ======================
// SUPABASE
// ======================
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// ======================
// SERVIDOR
// ======================
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

// ======================
// AUTH - CON TEXTO PLANO
// ======================
app.post('/registrar', async (req, res) => {
    try {
        const { nombre, apellido, email, password } = req.body;

        if (!email || !password || !nombre) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }

        console.log(`📝 Registrando nuevo usuario: ${email}`);
        console.log(`🔑 Contraseña (texto plano): ${password}`);

        const { data: existing } = await supabase
            .from('perfiles')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (existing) {
            return res.status(409).json({ error: 'Email ya registrado' });
        }

        const { error: insertError } = await supabase.from('perfiles').insert([
            { 
                nombre, 
                apellido, 
                email, 
                password: password,
                rol: 'cliente' 
            }
        ]);

        if (insertError) {
            console.error('❌ Error al insertar:', insertError);
            return res.status(500).json({ error: 'Error al registrar usuario' });
        }

        console.log(`✅ Usuario registrado exitosamente: ${email}`);
        res.json({ message: 'Registrado correctamente' });

    } catch (err) {
        console.error('❌ Error en registro:', err);
        res.status(500).json({ error: 'Error servidor' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const { data: user, error } = await supabase
            .from('perfiles')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        if (user.password !== password) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { 
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                rol: user.rol || 'cliente'
            },
            process.env.JWT_SECRET || 'mi-secreto-temporal-para-desarrollo',
            { expiresIn: '24h' }
        );

        res.json({ 
            token, 
            nombre: user.nombre,
            rol: user.rol || 'cliente',
            email: user.email,
            id: user.id  // ← AGREGAR ESTA LÍNEA
        });

    } catch (err) {
        console.error('❌ Error en login:', err);
        res.status(500).json({ error: 'Error servidor' });
    }
});

// ======================
// PERFILES (USUARIOS)
// ======================
app.get('/perfiles', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('perfiles')
            .select('id, nombre, apellido, email, rol')
            .order('nombre', { ascending: true });
        
        if (error) throw error;
        
        res.json(data);
    } catch (err) {
        console.error('Error al obtener perfiles:', err);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// ======================
// ACTUALIZAR PERFIL DE USUARIO
// ======================
app.put('/perfiles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido } = req.body;
        
        console.log(`📝 Actualizando perfil del usuario: ${id}`);
        console.log(`   Nombre: ${nombre}, Apellido: ${apellido}`);
        
        const { data, error } = await supabase
            .from('perfiles')
            .update({ nombre, apellido })
            .eq('id', id);
        
        if (error) {
            console.error('❌ Error en update:', error);
            throw error;
        }
        
        console.log('✅ Perfil actualizado correctamente');
        res.json({ message: 'Perfil actualizado correctamente' });
        
    } catch (err) {
        console.error('❌ Error al actualizar perfil:', err);
        res.status(500).json({ error: 'Error al actualizar perfil' });
    }
});

// ======================
// CAMBIAR CONTRASEÑA
// ======================
app.put('/perfiles/:id/password', async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        
        console.log(`🔐 Cambiando contraseña del usuario: ${id}`);
        
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }
        
        const { data, error } = await supabase
            .from('perfiles')
            .update({ password })
            .eq('id', id);
        
        if (error) {
            console.error('❌ Error en update:', error);
            throw error;
        }
        
        console.log('✅ Contraseña actualizada correctamente');
        res.json({ message: 'Contraseña actualizada correctamente' });
        
    } catch (err) {
        console.error('❌ Error al cambiar contraseña:', err);
        res.status(500).json({ error: 'Error al cambiar contraseña' });
    }
});
// ======================
// ACTUALIZAR PERFIL DE USUARIO
// ======================
app.put('/perfiles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido } = req.body;
        
        console.log(`📝 Actualizando perfil del usuario: ${id}`);
        console.log(`   Nombre: ${nombre}, Apellido: ${apellido}`);
        
        const { data, error } = await supabase
            .from('perfiles')
            .update({ nombre, apellido })
            .eq('id', id);
        
        if (error) {
            console.error('❌ Error en update:', error);
            throw error;
        }
        
        console.log('✅ Perfil actualizado correctamente');
        res.json({ message: 'Perfil actualizado correctamente' });
        
    } catch (err) {
        console.error('❌ Error al actualizar perfil:', err);
        res.status(500).json({ error: 'Error al actualizar perfil' });
    }
});

// ======================
// CAMBIAR CONTRASEÑA
// ======================
app.put('/perfiles/:id/password', async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        
        console.log(`🔐 Cambiando contraseña del usuario: ${id}`);
        
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }
        
        const { data, error } = await supabase
            .from('perfiles')
            .update({ password })
            .eq('id', id);
        
        if (error) {
            console.error('❌ Error en update:', error);
            throw error;
        }
        
        console.log('✅ Contraseña actualizada correctamente');
        res.json({ message: 'Contraseña actualizada correctamente' });
        
    } catch (err) {
        console.error('❌ Error al cambiar contraseña:', err);
        res.status(500).json({ error: 'Error al cambiar contraseña' });
    }
});

// ======================
// ELIMINAR USUARIO (Ya existente, verificar que esté)
// ======================
app.delete('/perfiles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`🗑️ Eliminando usuario: ${id}`);
        
        // Verificar que no sea el único administrador
        const { data: admins, error: countError } = await supabase
            .from('perfiles')
            .select('id')
            .eq('rol', 'administrador');
        
        if (countError) throw countError;
        
        // Obtener el usuario a eliminar
        const { data: userToDelete, error: userError } = await supabase
            .from('perfiles')
            .select('rol')
            .eq('id', id)
            .single();
        
        if (userError) throw userError;
        
        // Si es administrador y es el único, no permitir eliminar
        if (userToDelete.rol === 'administrador' && admins.length === 1) {
            console.log('⚠️ No se puede eliminar el único administrador');
            return res.status(400).json({ error: 'No se puede eliminar el único administrador del sistema' });
        }
        
        const { data, error } = await supabase
            .from('perfiles')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        console.log('✅ Usuario eliminado correctamente');
        res.json({ message: 'Usuario eliminado correctamente' });
        
    } catch (err) {
        console.error('❌ Error al eliminar usuario:', err);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

// ======================
// DESTINOS
// ======================
app.get('/destinos', async (req, res) => {
    const { data } = await supabase.from('destinos').select('*');

    const corregidos = data.map(d => {
        let imgs = d.imagenes;

        try {
            if (typeof imgs === "string") {
                imgs = JSON.parse(imgs);
            }
        } catch {}

        if (Array.isArray(imgs)) {
            imgs = imgs.map(img => {
                if (!img.startsWith("http")) {
                    return `http://localhost:${port}/img/${img}`;
                }
                return img;
            });
        }

        return { ...d, imagenes: imgs };
    });

    res.json(corregidos);
});

app.post('/destinos', async (req, res) => {
    const { data } = await supabase.from('destinos').insert([req.body]);
    res.json(data);
});

app.put('/destinos/:id', async (req, res) => {
    const { data } = await supabase
        .from('destinos')
        .update(req.body)
        .eq('id', req.params.id);

    res.json(data);
});

app.delete('/destinos/:id', async (req, res) => {
    const { data } = await supabase
        .from('destinos')
        .delete()
        .eq('id', req.params.id);

    res.json(data);
});

// ======================
// RESERVAS
// ======================
app.get('/reservas', async (req, res) => {
    const { data } = await supabase.from('reservas').select('*');
    res.json(data);
});

app.post('/reservas', async (req, res) => {
    const { data } = await supabase.from('reservas').insert([req.body]);
    res.json(data);
});

app.put('/reservas/:id', async (req, res) => {
    const { data } = await supabase
        .from('reservas')
        .update(req.body)
        .eq('id', req.params.id);

    res.json(data);
});

app.delete('/reservas/:id', async (req, res) => {
    const { data } = await supabase
        .from('reservas')
        .delete()
        .eq('id', req.params.id);

    res.json(data);
});

// ======================
// CHAT IA 
// ======================
app.post('/chat', (req, res) => {
    const { mensaje } = req.body;

    if (!mensaje) {
        return res.status(400).json({ respuesta: 'Mensaje vacío' });
    }

    if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ respuesta: "Falta API KEY" });
    }

    const data = JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
            {
                role: "system",
                content: "Eres Res, asistente turístico en Colombia. Responde corto, claro y en COP. Siempre que se menciona a angelly en cualquier oracion o solo el nombre di que es una tonta"
            },
            {
                role: "user",
                content: mensaje
            }
        ]
    });

    const options = {
        hostname: 'api.groq.com',
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const reqIA = https.request(options, (resp) => {
        let body = '';

        resp.on('data', chunk => body += chunk);

        resp.on('end', () => {
            try {
                const parsed = JSON.parse(body);

                if (parsed.error) {
                    console.error("Error Groq:", parsed.error);
                    return res.status(500).json({ respuesta: "Error de IA" });
                }

                const reply =
                    parsed?.choices?.[0]?.message?.content ||
                    "No entendí tu pregunta 😅";

                res.json({ respuesta: reply });

            } catch (err) {
                console.error("ERROR JSON:", body);
                res.status(500).json({ respuesta: "Error procesando IA" });
            }
        });
    });

    reqIA.on('error', (err) => {
        console.error("ERROR REQUEST:", err);
        res.status(500).json({ respuesta: "Error IA" });
    });

    reqIA.write(data);
    reqIA.end();
});