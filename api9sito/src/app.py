import os
from flask import Flask, jsonify, request
from flask_mysqldb import MySQL
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename


from config import config

app = Flask(__name__)

# IMPORTANTE: Habilitamos CORS para que Angular (puerto 4200) pueda hablar con Flask (puerto 5000)
CORS(app, resources={r"/api/*": {"origins": "*"}}) 
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


con = MySQL(app)

# ==========================================
# 1. RUTAS DE AUTENTICACIÓN (LOGIN Y REGISTRO)
# ==========================================

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        cursor = con.connection.cursor()
        # Recibir datos del JSON de Angular
        datos = request.json
        correo = datos.get('email')
        password = datos.get('password')

        # Buscar usuario por correo
        sql = "SELECT id, nombre, password, rol, estado, foto_url FROM usuarios WHERE correo = %s"
        cursor.execute(sql, (correo,))
        user = cursor.fetchone() # Devuelve una tupla (id, nombre, pass, rol...)

        if user:
            # user[2] es la contraseña encriptada en la BD
            if check_password_hash(user[2], password):
                if user[4] == 'Inactivo' or user[4] == 'Baneado':
                    return jsonify({'exito': False, 'mensaje': 'Usuario bloqueado o inactivo.'})

                # Si pasa, devolvemos los datos del usuario (MENOS LA CONTRASEÑA)
                usuario_data = {
                    'id': user[0],
                    'nombre': user[1],
                    'rol': user[3],
                    'foto_url': user[5]
                }
                return jsonify({'exito': True, 'mensaje': 'Login exitoso', 'usuario': usuario_data})
            else:
                return jsonify({'exito': False, 'mensaje': 'Contraseña incorrecta'})
        else:
            return jsonify({'exito': False, 'mensaje': 'Usuario no encontrado'})

    except Exception as ex:
        print(ex)
        return jsonify({'exito': False, 'mensaje': 'Error en el servidor'})

@app.route('/api/auth/registro-admin', methods=['POST'])
def registro_admin():
    try:
        cursor = con.connection.cursor()
        datos = request.json
        
        # 1. Validar si ya existe
        cursor.execute("SELECT id FROM usuarios WHERE correo = %s", (datos['email'],))
        if cursor.fetchone():
            return jsonify({'exito': False, 'mensaje': 'El correo ya está registrado'})

        # 2. Encriptar contraseña (IMPORTANTE PARA SEGURIDAD)
        hashed_password = generate_password_hash(datos['password'])

        # 3. Insertar Admin
        sql = """INSERT INTO usuarios (nombre, correo, password, rol, estado) 
                 VALUES (%s, %s, %s, 'Admin', 'Activo')"""
        
        cursor.execute(sql, (datos['nombre'], datos['email'], hashed_password))
        con.connection.commit()

        return jsonify({'exito': True, 'mensaje': 'Administrador registrado correctamente'})

    except Exception as ex:
        print(ex)
        return jsonify({'exito': False, 'mensaje': str(ex)})

# ==========================================
# 2. RUTAS DE AVISOS (CORE)
# ==========================================

@app.route('/api/avisos', methods=['GET'])
def get_avisos():
    try:
        cursor = con.connection.cursor()
        
        # CAMBIO IMPORTANTE: Usamos 'LEFT JOIN' en lugar de 'JOIN'
        # Esto trae el aviso aunque el usuario (autor) ya no exista.
        sql = """SELECT a.id, a.titulo, a.contenido, a.categoria, a.fecha_publicacion, a.imagen_url, u.nombre 
                 FROM avisos a 
                 LEFT JOIN usuarios u ON a.autor_id = u.id 
                 ORDER BY a.fecha_publicacion DESC"""
        
        cursor.execute(sql)
        datos = cursor.fetchall()
        
        avisos_list = []
        for fila in datos:
            avisos_list.append({
                'id': fila[0],
                'titulo': fila[1],
                'contenido': fila[2],
                'categoria': fila[3],
                'fecha': str(fila[4]),
                'imagen_url': f"http://localhost:5000/uploads/{fila[5]}" if fila[5] else None,
                # Si no hay usuario (fila[6] es None), ponemos 'Desconocido'
                'autor': fila[6] if fila[6] else 'Sistema / Desconocido' 
            })
            
        return jsonify(avisos_list)
    except Exception as ex:
        print("ERROR GET AVISOS:", ex)
        return jsonify({'error': str(ex)}), 500

# 2. CREAR AVISO (CON IMAGEN)
@app.route('/api/avisos', methods=['POST'])
def crear_aviso():
    try:
        cursor = con.connection.cursor()
        
        titulo = request.form.get('titulo')
        contenido = request.form.get('contenido')
        categoria = request.form.get('categoria')
        autor_id = request.form.get('autor_id')
        
        imagen_filename = None

        if 'imagen' in request.files:
            file = request.files['imagen']
            if file and file.filename != '':
                # Limpiamos el nombre
                filename = secure_filename(file.filename)
                # Si secure_filename devuelve vacío (ej: nombre era "%%%"), ponemos uno por defecto
                if not filename:
                    filename = 'imagen_aviso.jpg'
                
                # Guardamos usando la ruta absoluta configurada
                ruta_completa = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(ruta_completa)
                imagen_filename = filename

        sql = """INSERT INTO avisos (titulo, contenido, categoria, imagen_url, autor_id) 
                 VALUES (%s, %s, %s, %s, %s)"""
        
        cursor.execute(sql, (titulo, contenido, categoria, imagen_filename, autor_id))
        con.connection.commit()
        
        return jsonify({'exito': True, 'mensaje': 'Aviso publicado correctamente'})
    except Exception as ex:
        # Esto imprimirá el error real en tu terminal de Python para que sepas qué pasó
        print("ERROR EN SERVER:", str(ex)) 
        return jsonify({'exito': False, 'mensaje': str(ex)}), 500

# 3. SERVIR IMÁGENES (Para que Angular pueda verlas)
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# app.py - SECCIÓN AVISOS (Agrega estas rutas)

# 4. ACTUALIZAR AVISO
@app.route('/api/avisos/<int:id>', methods=['PUT'])
def actualizar_aviso(id):
    try:
        cursor = con.connection.cursor()
        
        # Recuperamos datos del formulario
        titulo = request.form.get('titulo')
        contenido = request.form.get('contenido')
        categoria = request.form.get('categoria')
        
        # Lógica para la imagen (solo si se sube una nueva)
        imagen_update_sql = ""
        params = [titulo, contenido, categoria]
        
        if 'imagen' in request.files:
            file = request.files['imagen']
            if file and file.filename != '':
                filename = secure_filename(file.filename) or 'aviso_update.jpg'
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                imagen_update_sql = ", imagen_url = %s"
                params.append(filename)
        
        # Añadimos el ID al final de los parámetros
        params.append(id)
        
        sql = f"UPDATE avisos SET titulo = %s, contenido = %s, categoria = %s {imagen_update_sql} WHERE id = %s"
        
        cursor.execute(sql, tuple(params))
        con.connection.commit()
        
        return jsonify({'exito': True, 'mensaje': 'Aviso actualizado correctamente'})
    except Exception as ex:
        print(ex)
        return jsonify({'exito': False, 'mensaje': str(ex)}), 500

# 5. ELIMINAR AVISO
@app.route('/api/avisos/<int:id>', methods=['DELETE'])
def eliminar_aviso(id):
    try:
        cursor = con.connection.cursor()
        # Opcional: Aquí podrías buscar la imagen y borrarla del disco también
        cursor.execute("DELETE FROM avisos WHERE id = %s", (id,))
        con.connection.commit()
        return jsonify({'exito': True, 'mensaje': 'Aviso eliminado'})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)}), 500

# ==========================================
# GESTIÓN DE USUARIOS (PANEL ADMIN)
# ==========================================

# app.py (Sección de Usuarios)

# 1. OBTENER TODOS LOS USUARIOS (Para la tabla del Admin)
@app.route('/api/usuarios', methods=['GET'])
def get_usuarios():
    try:
        cursor = con.connection.cursor()
        # Traemos todos los usuarios ordenados por nombre
        sql = "SELECT id, nombre, correo, rol, estado, fecha_registro FROM usuarios ORDER BY id DESC"
        cursor.execute(sql)
        datos = cursor.fetchall()
        
        usuarios = []
        for fila in datos:
            usuarios.append({
                'id': fila[0],
                'nombre': fila[1],
                'correo': fila[2],
                'rol': fila[3],
                'estado': fila[4],
                'fecha': str(fila[5])
            })
        return jsonify(usuarios)
    except Exception as ex:
        return jsonify({'error': str(ex)}), 500

# 2. CREAR USUARIO (Cualquier Rol - Función Administrativa)
@app.route('/api/usuarios', methods=['POST'])
def crear_usuario_admin():
    try:
        cursor = con.connection.cursor()
        datos = request.json
        
        # Validar si el correo ya existe
        cursor.execute("SELECT id FROM usuarios WHERE correo = %s", (datos['email'],))
        if cursor.fetchone():
            return jsonify({'exito': False, 'mensaje': 'El correo ya está registrado.'})

        # Encriptar la contraseña provisional
        hashed_password = generate_password_hash(datos['password'])

        sql = """INSERT INTO usuarios (nombre, correo, password, rol, estado) 
                 VALUES (%s, %s, %s, %s, 'Activo')"""
        
        cursor.execute(sql, (
            datos['nombre'], 
            datos['email'], 
            hashed_password, 
            datos['rol'] # Ahora recibimos el rol desde Angular
        ))
        con.connection.commit()
        
        return jsonify({'exito': True, 'mensaje': 'Usuario registrado exitosamente.'})

    except Exception as ex:
        print(ex)
        return jsonify({'exito': False, 'mensaje': str(ex)}), 500

# 3. CAMBIAR ESTADO (Activar/Desactivar)
@app.route('/api/usuarios/<int:id>/estado', methods=['PUT'])
def cambiar_estado_usuario(id):
    try:
        cursor = con.connection.cursor()
        
        # 1. Obtener estado actual (Limpiamos espacios con strip() por si acaso)
        cursor.execute("SELECT estado FROM usuarios WHERE id = %s", (id,))
        resultado = cursor.fetchone()
        
        if not resultado:
            return jsonify({'exito': False, 'mensaje': 'Usuario no encontrado'})
            
        estado_actual = resultado[0] # Ej: 'Activo'
        
        # 2. Determinar nuevo estado (Lógica invertida)
        # Si es Activo -> Pasa a Inactivo. Cualquier otra cosa -> Pasa a Activo.
        nuevo_estado = 'Inactivo' if estado_actual == 'Activo' else 'Activo'
        
        # 3. Actualizar en BD
        cursor.execute("UPDATE usuarios SET estado = %s WHERE id = %s", (nuevo_estado, id))
        
        # 4. ¡CRUCIAL! Guardar cambios
        con.connection.commit()
        
        print(f"Usuario {id} cambiado de {estado_actual} a {nuevo_estado}") # Log en consola para verificar
        
        return jsonify({'exito': True, 'mensaje': f'Estado cambiado a {nuevo_estado}'})
        
    except Exception as ex:
        print("ERROR CAMBIAR ESTADO:", ex) # Ver el error real
        return jsonify({'exito': False, 'mensaje': str(ex)}), 500
    
# 4. ACTUALIZAR ROL
@app.route('/api/usuarios/<int:id>/rol', methods=['PUT'])
def actualizar_rol_usuario(id):
    try:
        cursor = con.connection.cursor()
        nuevo_rol = request.json['rol']
        
        cursor.execute("UPDATE usuarios SET rol = %s WHERE id = %s", (nuevo_rol, id))
        con.connection.commit()
        
        return jsonify({'exito': True, 'mensaje': 'Rol actualizado correctamente.'})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)}), 500

# 5. RESETEAR CONTRASEÑA (Por el Admin)
@app.route('/api/usuarios/<int:id>/reset-password', methods=['PUT'])
def reset_password_usuario(id):
    try:
        cursor = con.connection.cursor()
        nueva_pass = request.json['password'] # Recibimos la nueva contraseña
        
        # Encriptamos
        hashed_password = generate_password_hash(nueva_pass)
        
        cursor.execute("UPDATE usuarios SET password = %s WHERE id = %s", (hashed_password, id))
        con.connection.commit()
        
        return jsonify({'exito': True, 'mensaje': 'Contraseña restablecida correctamente.'})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)}), 500
    
# 1. OBTENER TODO LO PENDIENTE (Raites + Mercado)
@app.route('/api/moderacion/pendientes', methods=['GET'])
def get_pendientes_unificados():
    try:
        cursor = con.connection.cursor()
        # Usamos UNION ALL para combinar resultados de dos tablas distintas
        # Seleccionamos columnas "comunes" y añadimos una columna 'tipo' 'hardcodeada'
        sql = """
            (SELECT 
                r.id, 
                'Raite' AS tipo, 
                CONCAT(r.tipo, ': ', r.origen, ' -> ', r.destino, ' (', TIME_FORMAT(r.hora_salida, '%H:%i'), ')') AS descripcion,
                u.nombre AS autor,
                r.fecha_creacion AS fecha
            FROM raites r
            JOIN usuarios u ON r.usuario_id = u.id
            WHERE r.estado = 'Pendiente')

            UNION ALL

            (SELECT 
                m.id, 
                'Mercado' AS tipo, 
                CONCAT(m.titulo, ' - $', m.precio) AS descripcion,
                u.nombre AS autor,
                m.fecha_publicacion AS fecha
            FROM mercado_articulos m
            JOIN usuarios u ON m.vendedor_id = u.id
            WHERE m.estado = 'Pendiente')

            ORDER BY fecha DESC;
        """
        cursor.execute(sql)
        datos = cursor.fetchall()
        
        pendientes = []
        for fila in datos:
            pendientes.append({
                'id': fila[0],
                'tipo': fila[1],       # 'Raite' o 'Mercado'
                'descripcion': fila[2],# Texto resumen del ítem
                'autor': fila[3],
                'fecha': str(fila[4])
            })
        return jsonify(pendientes)
    except Exception as ex:
        print(ex)
        return jsonify({'error': str(ex)}), 500

# 2. ACCIONES PARA RAITES (Aprobar/Rechazar)
@app.route('/api/moderacion/raites/<int:id>/<accion>', methods=['PUT'])
def moderar_raite(id, accion):
    try:
        cursor = con.connection.cursor()
        nuevo_estado = 'Activo' if accion == 'aprobar' else 'Rechazado'
        
        cursor.execute("UPDATE raites SET estado = %s WHERE id = %s", (nuevo_estado, id))
        con.connection.commit()
        return jsonify({'exito': True, 'mensaje': f'Raite {nuevo_estado.lower()}.'})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)}), 500

# 3. ACCIONES PARA MERCADO (Aprobar/Rechazar)
@app.route('/api/moderacion/mercado/<int:id>/<accion>', methods=['PUT'])
def moderar_mercado(id, accion):
    try:
        cursor = con.connection.cursor()
        nuevo_estado = 'Activo' if accion == 'aprobar' else 'Rechazado'
        
        cursor.execute("UPDATE mercado_articulos SET estado = %s WHERE id = %s", (nuevo_estado, id))
        con.connection.commit()
        return jsonify({'exito': True, 'mensaje': f'Artículo {nuevo_estado.lower()}.'})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)}), 500
    
# app.py - SECCIÓN DASHBOARD

@app.route('/api/admin/stats', methods=['GET'])
def get_dashboard_stats():
    try:
        cursor = con.connection.cursor()
        
        # 1. Usuarios Activos (Excluye Inactivos/Baneados)
        cursor.execute("SELECT COUNT(*) FROM usuarios WHERE estado = 'Activo'")
        total_usuarios = cursor.fetchone()[0]
        
        # 2. Pendientes de Aprobar (Raites + Mercado)
        cursor.execute("SELECT COUNT(*) FROM raites WHERE estado = 'Pendiente'")
        pendientes_raites = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM mercado_articulos WHERE estado = 'Pendiente'")
        pendientes_mercado = cursor.fetchone()[0]
        
        total_pendientes = pendientes_raites + pendientes_mercado
        
        # 3. Avisos Activos (Total de avisos publicados)
        cursor.execute("SELECT COUNT(*) FROM avisos")
        total_avisos = cursor.fetchone()[0]
        
        # 4. Reportes Abiertos (Soporte)
        # Asegúrate de tener la tabla 'reportes', si no existe dará 0 o error, 
        # pero la incluimos según tu modelo inicial.
        try:
            cursor.execute("SELECT COUNT(*) FROM reportes WHERE estado = 'Abierto'")
            total_reportes = cursor.fetchone()[0]
        except:
            total_reportes = 0 # Por si no has creado la tabla reportes aún

        stats = {
            'usuarios': total_usuarios,
            'pendientes': total_pendientes,
            'avisos': total_avisos,
            'reportes': total_reportes
        }
        
        return jsonify(stats)

    except Exception as ex:
        print(ex)
        return jsonify({'error': str(ex)}), 500

if __name__ == '__main__':
    app.config.from_object(config['development'])
    app.run(host='0.0.0.0', port=5000)