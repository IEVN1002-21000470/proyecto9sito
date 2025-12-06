import os
from flask import Flask, jsonify, request, send_from_directory
from flask_mysqldb import MySQL
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from config import config

app = Flask(__name__)

# --- CONFIGURACIÓN ---
app.config.from_object(config['development'])

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- CORS & DB ---
CORS(app, resources={r"/api/*": {"origins": "*"}})
con = MySQL(app)

# ==========================================
# 1. RUTAS DE AUTENTICACIÓN
# ==========================================

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        cursor = con.connection.cursor()
        datos = request.json
        correo = datos.get('email')
        password = datos.get('password')

        sql = "SELECT id, nombre, password, rol, estado, foto_url, telefono, bio, correo FROM usuarios WHERE correo = %s"
        cursor.execute(sql, (correo,))
        user = cursor.fetchone()

        if user:
            if check_password_hash(user[2], password):
                if user[4] in ['Inactivo', 'Baneado']:
                    return jsonify({'exito': False, 'mensaje': 'Usuario bloqueado.'})

                usuario_data = {
                    'id': user[0],
                    'nombre': user[1],
                    'rol': user[3],
                    'foto_url': user[5],
                    'telefono': user[6],
                    'bio': user[7],
                    'correo': user[8]
                }
                return jsonify({'exito': True, 'mensaje': 'Login exitoso', 'usuario': usuario_data})
            else:
                return jsonify({'exito': False, 'mensaje': 'Contraseña incorrecta'})
        else:
            return jsonify({'exito': False, 'mensaje': 'Usuario no encontrado'})

    except Exception as ex:
        print("ERROR LOGIN:", ex)
        return jsonify({'exito': False, 'mensaje': 'Error en el servidor'})

@app.route('/api/auth/registro-admin', methods=['POST'])
def registro_admin():
    try:
        cursor = con.connection.cursor()
        datos = request.json
        email_val = datos.get('email') or datos.get('correo')

        cursor.execute("SELECT id FROM usuarios WHERE correo = %s", (email_val,))
        if cursor.fetchone():
            return jsonify({'exito': False, 'mensaje': 'El correo ya está registrado'})

        hashed_password = generate_password_hash(datos['password'])
        sql = "INSERT INTO usuarios (nombre, correo, password, rol, estado) VALUES (%s, %s, %s, 'Admin', 'Activo')"
        cursor.execute(sql, (datos['nombre'], email_val, hashed_password))
        con.connection.commit()
        return jsonify({'exito': True, 'mensaje': 'Administrador registrado'})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)})

# ==========================================
# 2. GESTIÓN DE AVISOS
# ==========================================

@app.route('/api/avisos', methods=['GET'])
def get_avisos():
    try:
        cursor = con.connection.cursor()
        sql = """SELECT a.id, a.titulo, a.contenido, a.categoria, a.fecha_publicacion, a.imagen_url, u.nombre
                 FROM avisos a LEFT JOIN usuarios u ON a.autor_id = u.id ORDER BY a.fecha_publicacion DESC"""
        cursor.execute(sql)
        datos = cursor.fetchall()
        avisos_list = []
        for fila in datos:
            avisos_list.append({
                'id': fila[0], 'titulo': fila[1], 'contenido': fila[2], 'categoria': fila[3],
                'fecha': str(fila[4]), 'imagen_url': f"http://localhost:5000/uploads/{fila[5]}" if fila[5] else None,
                'autor': fila[6] if fila[6] else 'Sistema'
            })
        return jsonify(avisos_list)
    except Exception as ex:
        return jsonify({'error': str(ex)}), 500

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
                filename = secure_filename(file.filename) or 'imagen_aviso.jpg'
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                imagen_filename = filename
        sql = "INSERT INTO avisos (titulo, contenido, categoria, imagen_url, autor_id) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(sql, (titulo, contenido, categoria, imagen_filename, autor_id))
        con.connection.commit()
        return jsonify({'exito': True, 'mensaje': 'Aviso publicado'})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)}), 500

@app.route('/api/avisos/<int:id>', methods=['PUT'])
def actualizar_aviso(id):
    try:
        cursor = con.connection.cursor()
        titulo = request.form.get('titulo')
        contenido = request.form.get('contenido')
        categoria = request.form.get('categoria')
        sql_extra = ""
        params = [titulo, contenido, categoria]
        if 'imagen' in request.files:
            file = request.files['imagen']
            if file and file.filename != '':
                filename = secure_filename(file.filename) or 'aviso_update.jpg'
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                sql_extra = ", imagen_url = %s"
                params.append(filename)
        params.append(id)
        cursor.execute(f"UPDATE avisos SET titulo=%s, contenido=%s, categoria=%s {sql_extra} WHERE id=%s", tuple(params))
        con.connection.commit()
        return jsonify({'exito': True})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)}), 500

@app.route('/api/avisos/<int:id>', methods=['DELETE'])
def eliminar_aviso(id):
    try:
        cursor = con.connection.cursor()
        cursor.execute("DELETE FROM avisos WHERE id = %s", (id,))
        con.connection.commit()
        return jsonify({'exito': True})
    except Exception as ex:
        return jsonify({'exito': False})

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ==========================================
# 3. GESTIÓN DE USUARIOS
# ==========================================

@app.route('/api/usuarios', methods=['GET'])
def get_usuarios():
    try:
        cursor = con.connection.cursor()
        cursor.execute("SELECT id, nombre, correo, rol, estado, fecha_registro FROM usuarios ORDER BY id DESC")
        datos = cursor.fetchall()
        usuarios = [{'id': f[0], 'nombre': f[1], 'correo': f[2], 'rol': f[3], 'estado': f[4], 'fecha': str(f[5])} for f in datos]
        return jsonify(usuarios)
    except Exception as ex:
        return jsonify({'error': str(ex)}), 500

@app.route('/api/usuarios', methods=['POST'])
def crear_usuario_admin():
    try:
        cursor = con.connection.cursor()
        datos = request.json
        correo_usuario = datos.get('correo')
        if not correo_usuario: return jsonify({'exito': False, 'mensaje': 'Falta el campo correo'})
        cursor.execute("SELECT id FROM usuarios WHERE correo = %s", (correo_usuario,))
        if cursor.fetchone(): return jsonify({'exito': False, 'mensaje': 'Correo registrado'})
        hashed = generate_password_hash(datos['password'])
        cursor.execute("INSERT INTO usuarios (nombre, correo, password, rol, estado) VALUES (%s, %s, %s, %s, 'Activo')",
                       (datos['nombre'], correo_usuario, hashed, datos['rol']))
        con.connection.commit()
        return jsonify({'exito': True})
    except Exception as ex:
        print("ERROR CREAR USUARIO:", ex)
        return jsonify({'exito': False, 'mensaje': str(ex)}), 500

@app.route('/api/usuarios/<int:id>/estado', methods=['PUT'])
def cambiar_estado_usuario(id):
    try:
        cursor = con.connection.cursor()
        cursor.execute("UPDATE usuarios SET estado = IF(estado='Activo','Inactivo','Activo') WHERE id=%s", (id,))
        con.connection.commit()
        return jsonify({'exito': True})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)})

@app.route('/api/usuarios/<int:id>/rol', methods=['PUT'])
def actualizar_rol_usuario(id):
    try:
        cursor = con.connection.cursor()
        cursor.execute("UPDATE usuarios SET rol = %s WHERE id=%s", (request.json['rol'], id))
        con.connection.commit()
        return jsonify({'exito': True})
    except Exception as ex:
        return jsonify({'exito': False})

@app.route('/api/usuarios/<int:id>/reset-password', methods=['PUT'])
def reset_password_usuario(id):
    try:
        cursor = con.connection.cursor()
        hashed = generate_password_hash(request.json['password'])
        cursor.execute("UPDATE usuarios SET password = %s WHERE id=%s", (hashed, id))
        con.connection.commit()
        return jsonify({'exito': True})
    except Exception as ex:
        return jsonify({'exito': False})

# ==========================================
# 4. MODERACIÓN Y DASHBOARD
# ==========================================

@app.route('/api/moderacion/pendientes', methods=['GET'])
def get_pendientes_unificados():
    try:
        cursor = con.connection.cursor()
        sql = """
            (SELECT r.id, 'Raite' as tipo, CONCAT(r.origen, ' -> ', r.destino) as descripcion, u.nombre, r.fecha_creacion
             FROM raites r JOIN usuarios u ON r.usuario_id = u.id WHERE r.estado = 'Pendiente')
            UNION ALL
            (SELECT m.id, 'Mercado' as tipo, CONCAT(m.titulo, ' - $', m.precio) as descripcion, u.nombre, m.fecha_publicacion
             FROM mercado_articulos m JOIN usuarios u ON m.vendedor_id = u.id WHERE m.estado = 'Pendiente')
            ORDER BY fecha_creacion DESC
        """
        cursor.execute(sql)
        datos = cursor.fetchall()
        pendientes = [{'id': f[0], 'tipo': f[1], 'descripcion': f[2], 'autor': f[3], 'fecha': str(f[4])} for f in datos]
        return jsonify(pendientes)
    except Exception as ex:
        return jsonify({'error': str(ex)}), 500

@app.route('/api/moderacion/<tipo>/<int:id>/<accion>', methods=['PUT'])
def moderar_item(tipo, id, accion):
    try:
        tabla = 'raites' if tipo == 'raites' else 'mercado_articulos'
        estado = 'Activo' if accion == 'aprobar' else 'Rechazado'
        cursor = con.connection.cursor()
        cursor.execute(f"UPDATE {tabla} SET estado = %s WHERE id = %s", (estado, id))
        con.connection.commit()
        return jsonify({'exito': True})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)})

@app.route('/api/admin/stats', methods=['GET'])
def get_dashboard_stats():
    try:
        cursor = con.connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM usuarios WHERE estado='Activo'")
        u = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM raites WHERE estado='Pendiente'")
        pr = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM mercado_articulos WHERE estado='Pendiente'")
        pm = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM avisos")
        a = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM reportes WHERE estado='Abierto'")
        r = cursor.fetchone()[0]

        return jsonify({'usuarios': u, 'pendientes': pr+pm, 'avisos': a, 'reportes': r})
    except Exception:
        return jsonify({'error': 'Error stats'}), 500

# ==========================================
# 5. MÓDULO DE RAITES (MODIFICADO)
# ==========================================

@app.route('/api/raites', methods=['GET'])
def get_raites_activos():
    try:
        cursor = con.connection.cursor()
        # Modificado: GROUP_CONCAT para traer los pasajeros asociados a cada raite
        sql = """
            SELECT r.id, r.tipo, r.origen, r.destino, TIME_FORMAT(r.hora_salida, '%H:%i'),
                   r.cupo_disponible, r.nota, u.nombre, u.foto_url, u.telefono, r.usuario_id,
                   GROUP_CONCAT(CONCAT(s.passenger_id, ':', u2.nombre, ':', IFNULL(u2.telefono, 'Sin tel')) SEPARATOR '|') as solicitudes
            FROM raites r
            JOIN usuarios u ON r.usuario_id = u.id
            LEFT JOIN solicitudes_raites s ON r.id = s.raite_id
            LEFT JOIN usuarios u2 ON s.passenger_id = u2.id
            WHERE r.estado = 'Activo'
            GROUP BY r.id
            ORDER BY r.fecha_creacion DESC
        """
        cursor.execute(sql)
        datos = cursor.fetchall()
        lista = []
        for fila in datos:
            # Procesamos las solicitudes en una lista de objetos
            solicitudes_raw = fila[11]
            pasajeros = []
            ids_pasajeros = []

            if solicitudes_raw:
                for sol in solicitudes_raw.split('|'):
                    partes = sol.split(':')
                    if len(partes) >= 3:
                        pid = int(partes[0])
                        pasajeros.append({'id': pid, 'nombre': partes[1], 'telefono': partes[2]})
                        ids_pasajeros.append(pid)

            lista.append({
                'id': fila[0], 'tipo': fila[1], 'origen': fila[2], 'destino': fila[3],
                'hora': fila[4], 'cupo': fila[5], 'nota': fila[6],
                'usuario': fila[7], 'foto': fila[8], 'telefono': fila[9], 'usuario_id': fila[10],
                'pasajeros': pasajeros,
                'ids_pasajeros': ids_pasajeros
            })
        return jsonify(lista)
    except Exception as ex:
        print("ERROR RAITES GET:", ex)
        return jsonify({'error': str(ex)}), 500

@app.route('/api/raites', methods=['POST'])
def crear_raite():
    try:
        cursor = con.connection.cursor()
        d = request.json
        sql = """INSERT INTO raites (usuario_id, tipo, origen, destino, hora_salida, cupo_disponible, nota, estado)
                 VALUES (%s, %s, %s, %s, %s, %s, %s, 'Pendiente')"""
        cursor.execute(sql, (d['usuario_id'], d['tipo'], d['origen'], d['destino'], d['hora'], d['cupo'], d.get('nota', '')))
        con.connection.commit()
        return jsonify({'exito': True, 'mensaje': 'Enviado a revisión.'})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)}), 500

@app.route('/api/raites/<int:id>/solicitar', methods=['PUT'])
def solicitar_cupo_raite(id):
    try:
        cursor = con.connection.cursor()
        usuario_solicitante = request.json.get('usuario_id')

        # 1. Verificar existencia y cupo
        cursor.execute("SELECT cupo_disponible, estado FROM raites WHERE id = %s", (id,))
        raite = cursor.fetchone()
        if not raite: return jsonify({'exito': False, 'mensaje': 'El raite no existe'})

        cupo_actual, estado = raite
        if estado != 'Activo': return jsonify({'exito': False, 'mensaje': 'Este raite no está activo.'})
        if cupo_actual <= 0: return jsonify({'exito': False, 'mensaje': 'Ya no hay lugares disponibles.'})

        # 2. Verificar si ya solicitó (usando la tabla unique)
        cursor.execute("SELECT id FROM solicitudes_raites WHERE raite_id = %s AND passenger_id = %s", (id, usuario_solicitante))
        if cursor.fetchone():
            return jsonify({'exito': False, 'mensaje': 'Ya has solicitado un asiento en este viaje.'})

        # 3. Registrar solicitud y bajar cupo
        cursor.execute("INSERT INTO solicitudes_raites (raite_id, passenger_id) VALUES (%s, %s)", (id, usuario_solicitante))
        cursor.execute("UPDATE raites SET cupo_disponible = cupo_disponible - 1 WHERE id = %s", (id,))

        con.connection.commit()
        return jsonify({'exito': True, 'mensaje': 'Lugar reservado correctamente.', 'nuevo_cupo': cupo_actual - 1})

    except Exception as ex:
        # Captura error de llave duplicada si pasa la verificación manual
        if "Duplicate entry" in str(ex):
             return jsonify({'exito': False, 'mensaje': 'Ya solicitaste este raite.'})
        return jsonify({'exito': False, 'mensaje': str(ex)}), 500

@app.route('/api/raites/<int:id>', methods=['DELETE'])
def eliminar_raite(id):
    try:
        cursor = con.connection.cursor()
        # Verificar permisos o propiedad se hace idealmente aquí,
        # pero confiaremos en que el frontend manda el ID correcto por ahora.
        cursor.execute("DELETE FROM raites WHERE id = %s", (id,))
        con.connection.commit()
        return jsonify({'exito': True, 'mensaje': 'Raite eliminado correctamente'})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)}), 500

# ==========================================
# 6. MÓDULO DE MERCADO
# ==========================================

@app.route('/api/mercado', methods=['GET'])
def get_mercado():
    try:
        cursor = con.connection.cursor()
        sql = """
            SELECT m.id, m.titulo, m.descripcion, m.precio, m.categoria, m.foto_url,
                   u.nombre, 'Venta' as tipo, u.telefono, m.vendedor_id, m.estado, u.correo
            FROM mercado_articulos m JOIN usuarios u ON m.vendedor_id = u.id
            WHERE m.estado IN ('Activo', 'Pausado') ORDER BY m.fecha_publicacion DESC
        """
        cursor.execute(sql)
        datos = cursor.fetchall()
        lista = []
        for fila in datos:
            lista.append({
                'id': fila[0], 'titulo': fila[1], 'descripcion': fila[2], 'precio': fila[3], 'categoria': fila[4],
                'imagen': f"http://localhost:5000/uploads/{fila[5]}" if fila[5] else None,
                'vendedor': fila[6], 'tipo': fila[7], 'telefono': fila[8], 'vendedor_id': fila[9], 'estado': fila[10], 'correo': fila[11]
            })
        return jsonify(lista)
    except Exception as ex:
        return jsonify({'error': str(ex)}), 500

@app.route('/api/mercado', methods=['POST'])
def publicar_articulo():
    try:
        cursor = con.connection.cursor()
        vendedor_id = request.form.get('vendedor_id')
        titulo = request.form.get('titulo')
        descripcion = request.form.get('descripcion')
        precio = request.form.get('precio')
        categoria = request.form.get('categoria')
        imagen_filename = None
        if 'imagen' in request.files:
            file = request.files['imagen']
            if file and file.filename != '':
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                imagen_filename = filename
        sql = """INSERT INTO mercado_articulos (vendedor_id, titulo, descripcion, precio, categoria, foto_url, estado)
                 VALUES (%s, %s, %s, %s, %s, %s, 'Pendiente')"""
        cursor.execute(sql, (vendedor_id, titulo, descripcion, precio, categoria, imagen_filename))
        con.connection.commit()
        return jsonify({'exito': True, 'mensaje': 'Artículo enviado a revisión.'})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)}), 500

@app.route('/api/mercado/<int:id>/estado', methods=['PUT'])
def cambiar_estado_mercado(id):
    try:
        cursor = con.connection.cursor()
        nuevo_estado = request.json.get('estado')
        if nuevo_estado not in ['Activo', 'Pausado']: return jsonify({'exito': False, 'mensaje': 'Estado inválido'})
        cursor.execute("UPDATE mercado_articulos SET estado = %s WHERE id = %s", (nuevo_estado, id))
        con.connection.commit()
        return jsonify({'exito': True})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)}), 500

@app.route('/api/mercado/<int:id>', methods=['DELETE'])
def eliminar_mercado(id):
    try:
        cursor = con.connection.cursor()
        cursor.execute("DELETE FROM mercado_articulos WHERE id = %s", (id,))
        con.connection.commit()
        return jsonify({'exito': True})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)}), 500

# ==========================================
# 7. MÓDULO DE BOLSA, CURSOS Y DIRECTORIO
# ==========================================

@app.route('/api/bolsa', methods=['GET'])
def get_vacantes():
    try:
        cursor = con.connection.cursor()
        sql = "SELECT id, puesto, empresa, tipo_contrato, ubicacion, descripcion, requisitos FROM vacantes WHERE estado='Activo' ORDER BY fecha_publicacion DESC"
        cursor.execute(sql)
        datos = [{'id': f[0], 'puesto': f[1], 'empresa': f[2], 'tipo': f[3], 'ubicacion': f[4], 'descripcion': f[5], 'requisitos': f[6]} for f in cursor.fetchall()]
        return jsonify(datos)
    except Exception as ex:
        return jsonify({'error': str(ex)})

@app.route('/api/bolsa', methods=['POST'])
def crear_vacante():
    try:
        cursor = con.connection.cursor()
        data = request.json
        sql = """INSERT INTO vacantes (puesto, empresa, tipo_contrato, ubicacion, descripcion, requisitos, estado)
                 VALUES (%s, %s, %s, %s, %s, %s, 'Activo')"""
        cursor.execute(sql, (data['puesto'], data['empresa'], data['tipo'], data['ubicacion'], data.get('descripcion', ''), data.get('requisitos', '')))
        con.connection.commit()
        return jsonify({'exito': True, 'mensaje': 'Vacante publicada exitosamente'})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)})

@app.route('/api/bolsa/<int:id>', methods=['DELETE'])
def eliminar_vacante(id):
    try:
        cursor = con.connection.cursor()
        cursor.execute("DELETE FROM vacantes WHERE id = %s", (id,))
        con.connection.commit()
        return jsonify({'exito': True, 'mensaje': 'Vacante eliminada'})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)})

# --- CURSOS ---
@app.route('/api/cursos', methods=['GET'])
def get_cursos():
    try:
        cursor = con.connection.cursor()
        cursor.execute("SELECT id, titulo, fecha_inicio, modalidad, descripcion FROM cursos WHERE estado='Abierto' ORDER BY fecha_inicio ASC")
        datos = [{'id': f[0], 'titulo': f[1], 'fecha': str(f[2]), 'modalidad': f[3], 'descripcion': f[4]} for f in cursor.fetchall()]
        return jsonify(datos)
    except Exception as ex:
        return jsonify({'error': str(ex)})

@app.route('/api/cursos', methods=['POST'])
def crear_curso():
    try:
        cursor = con.connection.cursor()
        data = request.json
        sql = """INSERT INTO cursos (titulo, fecha_inicio, modalidad, descripcion, estado)
                 VALUES (%s, %s, %s, %s, 'Abierto')"""
        cursor.execute(sql, (data['titulo'], data['fecha'], data['modalidad'], data.get('descripcion', '')))
        con.connection.commit()
        return jsonify({'exito': True, 'mensaje': 'Curso publicado exitosamente'})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)})

@app.route('/api/cursos/<int:id>', methods=['DELETE'])
def eliminar_curso(id):
    try:
        cursor = con.connection.cursor()
        cursor.execute("DELETE FROM cursos WHERE id = %s", (id,))
        con.connection.commit()
        return jsonify({'exito': True, 'mensaje': 'Curso eliminado'})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)})

# --- DIRECTORIO ---
@app.route('/api/directorio', methods=['GET'])
def get_directorio():
    try:
        cursor = con.connection.cursor()
        cursor.execute("SELECT id, nombre, rol_area, correo_contacto, telefono_ext FROM directorio")
        datos = [{'id': f[0], 'nombre': f[1], 'puesto': f[2], 'correo': f[3], 'oficina': f[4], 'avatar': f"https://ui-avatars.com/api/?name={f[1]}&background=random"} for f in cursor.fetchall()]
        return jsonify(datos)
    except Exception as ex:
        return jsonify({'error': str(ex)})

@app.route('/api/directorio', methods=['POST'])
def crear_contacto():
    try:
        cursor = con.connection.cursor()
        d = request.json
        sql = "INSERT INTO directorio (nombre, rol_area, correo_contacto, telefono_ext, tipo) VALUES (%s, %s, %s, %s, 'Institucional')"
        cursor.execute(sql, (d['nombre'], d['puesto'], d['correo'], d['oficina']))
        con.connection.commit()
        return jsonify({'exito': True, 'mensaje': 'Contacto agregado'})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': str(ex)})

@app.route('/api/directorio/<int:id>', methods=['DELETE'])
def eliminar_contacto(id):
    try:
        cursor = con.connection.cursor()
        cursor.execute("DELETE FROM directorio WHERE id = %s", (id,))
        con.connection.commit()
        return jsonify({'exito': True})
    except Exception as ex:
        return jsonify({'exito': False})

# --- CALENDARIO (GET) ---
@app.route('/api/calendario', methods=['GET'])
def get_eventos():
    try:
        cursor = con.connection.cursor()
        cursor.execute("SELECT DAY(fecha_inicio), titulo, tipo FROM eventos WHERE MONTH(fecha_inicio) = MONTH(CURRENT_DATE())")
        datos = [{'dia': f[0], 'titulo': f[1], 'tipo': f[2]} for f in cursor.fetchall()]
        return jsonify(datos)
    except Exception as ex:
        return jsonify({'error': str(ex)})

# ==========================================
# 8. MÓDULO DE PERFIL
# ==========================================

@app.route('/api/usuarios/<int:id>/perfil', methods=['PUT'])
def actualizar_perfil_usuario(id):
    try:
        cursor = con.connection.cursor()
        datos = request.json
        sql = "UPDATE usuarios SET telefono = %s, bio = %s WHERE id = %s"
        cursor.execute(sql, (datos.get('telefono', ''), datos.get('bio', ''), id))
        con.connection.commit()
        return jsonify({'exito': True, 'mensaje': 'Perfil actualizado correctamente'})
    except Exception as ex:
        return jsonify({'exito': False, 'mensaje': 'Error al actualizar perfil'}), 500

@app.route('/api/usuarios/<int:id>/stats', methods=['GET'])
def get_stats_usuario(id):
    try:
        cursor = con.connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM raites WHERE usuario_id = %s", (id,))
        total_raites = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM mercado_articulos WHERE vendedor_id = %s", (id,))
        total_ventas = cursor.fetchone()[0]
        return jsonify({'exito': True, 'raites': total_raites, 'ventas': total_ventas})
    except Exception as ex:
        return jsonify({'exito': False, 'error': str(ex)}), 500

@app.route('/api/usuarios/<int:id>/perfil-data', methods=['GET'])
def get_perfil_data(id):
    try:
        cursor = con.connection.cursor()
        cursor.execute("SELECT id, origen, destino, estado, fecha_creacion FROM raites WHERE usuario_id = %s ORDER BY fecha_creacion DESC LIMIT 5", (id,))
        raites = [{'id': r[0], 'origen': r[1], 'destino': r[2], 'estado': r[3]} for r in cursor.fetchall()]

        cursor.execute("SELECT id, titulo, precio, estado, fecha_publicacion FROM mercado_articulos WHERE vendedor_id = %s ORDER BY fecha_publicacion DESC LIMIT 5", (id,))
        ventas = [{'id': r[0], 'titulo': r[1], 'precio': r[2], 'estado': r[3]} for r in cursor.fetchall()]
        return jsonify({'exito': True, 'raites': raites, 'ventas': ventas})
    except Exception as ex:
        return jsonify({'exito': False, 'error': str(ex)}), 500

# ==========================================
# 9. MÓDULO DE REPORTES (NUEVO)
# ==========================================

@app.route('/api/reportes', methods=['POST'])
def crear_reporte():
    try:
        cursor = con.connection.cursor()
        body = request.get_json()

        # Validación simple
        if not body or 'descripcion' not in body:
            return jsonify({'exito': False, 'mensaje': 'Faltan datos'}), 400

        # Asignamos valores por defecto si no vienen
        usuario_id = body.get('usuario_id', None)
        asunto = body.get('asunto', 'Reporte General')
        categoria = body.get('categoria', 'General')
        descripcion = body.get('descripcion')

        sql = """INSERT INTO reportes (usuario_id, asunto, descripcion, categoria)
                 VALUES (%s, %s, %s, %s)"""

        cursor.execute(sql, (usuario_id, asunto, descripcion, categoria))
        con.connection.commit()

        return jsonify({'exito': True, 'mensaje': 'Reporte registrado exitosamente'}), 200

    except Exception as e:
        print("ERROR REPORTES:", e)
        return jsonify({'exito': False, 'mensaje': 'Error en el servidor: ' + str(e)}), 500

@app.route('/api/reportes', methods=['GET'])
def listar_reportes():
    try:
        cursor = con.connection.cursor()
        cursor.execute("SELECT id, usuario_id, asunto, descripcion, categoria, fecha_reporte FROM reportes ORDER BY fecha_reporte DESC")
        datos = cursor.fetchall()

        lista_reportes = []
        for fila in datos:
            lista_reportes.append({
                'id': fila[0],
                'usuario_id': fila[1],
                'asunto': fila[2],
                'descripcion': fila[3],
                'categoria': fila[4],
                'fecha_reporte': str(fila[5])
            })

        return jsonify(lista_reportes), 200

    except Exception as e:
        return jsonify({'exito': False, 'mensaje': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
