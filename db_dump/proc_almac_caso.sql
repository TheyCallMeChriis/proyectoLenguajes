USE taller;
SET GLOBAL log_bin_trust_function_creators = 1;

DELIMITER $$

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS BÁSICOS PARA CASOS
-- VALIDACIONES AGREGADAS:
-- - nuevoCaso: valida existencia de técnico y creador
-- - editarCaso: valida existencia de técnico
-- - cambiarEstadoCaso: valida existencia de responsable
-- - eliminarCaso: solo permite eliminar casos con estado 0 o 6
--
-- CÓDIGOS DE RETORNO:
-- nuevoCaso:
--   0: Éxito
--   1: Ya existe caso activo para el artefacto
--   2: Técnico no existe
--   3: Creador no existe
--   4: Artefacto no existe
--
-- editarCaso:
--   0: Caso no existe
--   1: Éxito
--  -1: Artefacto no existe
--  -2: Ya existe caso activo para ese artefacto
--  -3: Técnico no existe
--
-- cambiarEstadoCaso:
--   0: Éxito
--   1: Estado inválido
--   2: Responsable no existe
--
-- eliminarCaso:
--   0: Caso no encontrado
--   1: Eliminado exitosamente
--   2: No se puede eliminar (estado no permite eliminación)
-- =====================================================

-- Buscar caso por ID (simple como artefacto)
DROP PROCEDURE IF EXISTS buscarCaso$$
CREATE PROCEDURE buscarCaso (_id INT)
BEGIN
    SELECT * FROM caso WHERE id = _id;
END$$

-- Filtrar casos con paginación (básico)
DROP PROCEDURE IF EXISTS filtrarCaso$$
CREATE PROCEDURE filtrarCaso (
    _parametros VARCHAR(250), -- %codigo%&%idTecnico%&%idArtefacto%&%descripcion%&
    _pagina SMALLINT UNSIGNED, 
    _cantRegs SMALLINT UNSIGNED)
BEGIN
    SELECT cadenaFiltro(_parametros, 'codigo&idTecnico&idArtefacto&descripcion&') INTO @filtro;
    -- Reemplazar 'codigo' con 'id' para la consulta SQL
    SELECT REPLACE(@filtro, 'codigo', 'id') INTO @filtro;
    SELECT CONCAT("SELECT * FROM caso WHERE ", @filtro, " LIMIT ", 
        _pagina, ", ", _cantRegs) INTO @sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

-- Contar registros de casos filtrados (básico)
DROP PROCEDURE IF EXISTS numRegsCaso$$
CREATE PROCEDURE numRegsCaso (_parametros VARCHAR(250))
BEGIN
    SELECT cadenaFiltro(_parametros, 'codigo&idTecnico&idArtefacto&descripcion&') INTO @filtro;
    -- Reemplazar 'codigo' con 'id' para la consulta SQL
    SELECT REPLACE(@filtro, 'codigo', 'id') INTO @filtro;
    SELECT CONCAT("SELECT COUNT(id) FROM caso WHERE ", @filtro) INTO @sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

-- Crear nuevo caso (siguiendo patrón artefacto)

-- Crear nuevo caso (simple: busca primero por id, luego por serie)
DROP FUNCTION IF EXISTS nuevoCaso$$
CREATE FUNCTION nuevoCaso (
    _idTecnico VARCHAR(15),
    _idCreador VARCHAR(15),
    _idArtefacto VARCHAR(15),
    _descripcion VARCHAR(100)
)
RETURNS INT(1)
BEGIN
    DECLARE _cant INT;
    DECLARE _idCaso INT;
    DECLARE _serieArtefacto VARCHAR(15);

    -- Verificar que el técnico existe (buscar en tabla usuario)
    SELECT COUNT(idUsuario) INTO _cant FROM usuario WHERE idUsuario = _idTecnico;
    IF _cant = 0 THEN
        RETURN 2; -- Técnico no existe
    END IF;

    -- Verificar que el creador existe (buscar en tabla usuario)
    SELECT COUNT(idUsuario) INTO _cant FROM usuario WHERE idUsuario = _idCreador;
    IF _cant = 0 THEN
        RETURN 3; -- Creador no existe
    END IF;

    -- Buscar primero por id para obtener la serie
    SELECT serie INTO _serieArtefacto FROM artefacto WHERE id = _idArtefacto LIMIT 1;
    -- Si no existe, buscar por serie (ya tenemos la serie)
    IF _serieArtefacto IS NULL THEN
        SELECT serie INTO _serieArtefacto FROM artefacto WHERE serie = _idArtefacto LIMIT 1;
    END IF;

    -- Verificar que el artefacto existe
    IF _serieArtefacto IS NULL THEN
        RETURN 4; -- Artefacto no existe
    END IF;

    -- Verificar que no hay caso activo para este artefacto (buscar por serie)
    SELECT COUNT(id) INTO _cant FROM caso WHERE idArtefacto = _serieArtefacto AND fechaSalida IS NULL;
    IF _cant > 0 THEN
        RETURN 1; -- Ya existe caso activo
    END IF;

    -- Crear el caso guardando la SERIE como idArtefacto
    INSERT INTO caso(idTecnico, idCreador, idArtefacto, descripcion, fechaEntrada)
    VALUES (_idTecnico, _idCreador, _serieArtefacto, _descripcion, CURDATE());

    SET _idCaso = LAST_INSERT_ID();

    -- Crear entrada inicial en historial
    INSERT INTO historialCaso(idCaso, idResponsable, estado, fechaCambio, descripcion)
    VALUES (_idCaso, _idCreador, 0, CURDATE(), 'Caso creado - Estado: Aceptado');

    RETURN 0; -- Éxito
END$$


-- Editar caso (simple: permite cambiar artefacto, busca por id y si no, por serie)
DROP FUNCTION IF EXISTS editarCaso$$
CREATE FUNCTION editarCaso (
    _id INT,
    _idTecnico VARCHAR(15),
    _descripcion VARCHAR(100),
    _idArtefacto VARCHAR(15)
)
RETURNS INT(1)
BEGIN
    DECLARE _cant INT;
    DECLARE _serieArtefacto VARCHAR(15);

    -- Validar que el caso existe
    SELECT COUNT(id) INTO _cant FROM caso WHERE id = _id;
    IF _cant = 0 THEN
        RETURN 0; -- Caso no existe
    END IF;

    -- Verificar que el técnico existe (buscar en tabla usuario)
    SELECT COUNT(idUsuario) INTO _cant FROM usuario WHERE idUsuario = _idTecnico;
    IF _cant = 0 THEN
        RETURN -3; -- Técnico no existe
    END IF;

    -- Si se quiere cambiar el artefacto
    IF _idArtefacto IS NOT NULL AND LENGTH(_idArtefacto) > 0 THEN
        -- Buscar primero por id para obtener la serie
        SELECT serie INTO _serieArtefacto FROM artefacto WHERE id = _idArtefacto LIMIT 1;
        -- Si no existe, buscar por serie (ya tenemos la serie)
        IF _serieArtefacto IS NULL THEN
            SELECT serie INTO _serieArtefacto FROM artefacto WHERE serie = _idArtefacto LIMIT 1;
        END IF;

        -- Validar que el artefacto existe
        IF _serieArtefacto IS NULL THEN
            RETURN -1; -- Artefacto no existe
        END IF;

        -- No permitir dos casos activos para el mismo artefacto (buscar por serie)
        SELECT COUNT(id) INTO _cant FROM caso WHERE idArtefacto = _serieArtefacto AND fechaSalida IS NULL AND id <> _id;
        IF _cant > 0 THEN
            RETURN -2; -- Ya existe caso activo para ese artefacto
        END IF;

        UPDATE caso SET
            idTecnico = _idTecnico,
            descripcion = _descripcion,
            idArtefacto = _serieArtefacto  -- Guardar la SERIE
        WHERE id = _id;
    ELSE
        UPDATE caso SET
            idTecnico = _idTecnico,
            descripcion = _descripcion
        WHERE id = _id;
    END IF;

    RETURN 1; -- Éxito
END$$


-- Eliminar caso (permite eliminar si estado es 0-Aceptado o 6-Entregado)
DROP FUNCTION IF EXISTS eliminarCaso$$
CREATE FUNCTION eliminarCaso (_id INT)
RETURNS INT(1)
BEGIN
    DECLARE _cant INT;
    DECLARE _resp INT;
    DECLARE _estadoActual INT;
    SELECT 0 INTO _resp;
    
    SELECT COUNT(id) INTO _cant FROM caso WHERE id = _id;
    IF _cant > 0 THEN
        SELECT _cant INTO _resp;
        
        -- Obtener el estado actual del caso (el más reciente en historial)
        SELECT COALESCE(estado, 0) INTO _estadoActual
        FROM historialCaso 
        WHERE idCaso = _id 
        ORDER BY fechaCambio DESC, id DESC 
        LIMIT 1;
        
        -- Permitir eliminar solo si el estado es 0 (Aceptado) o 6 (Entregado)
        IF _estadoActual = 0 OR _estadoActual = 6 THEN
            DELETE FROM historialCaso WHERE idCaso = _id;
            DELETE FROM caso WHERE id = _id;
        ELSE 
            SELECT 2 INTO _resp; -- No se puede eliminar por estado activo
        END IF;
    END IF;
    
    RETURN _resp;
END$$

-- =====================================================
-- PROCEDIMIENTOS ESPECÍFICOS DEL NEGOCIO
-- =====================================================

-- Consultar estado de caso (para GET /caso/estado)
DROP PROCEDURE IF EXISTS consultarEstadoCaso$$
CREATE PROCEDURE consultarEstadoCaso (_idCaso INT)
BEGIN
    SELECT c.*,
           a.serie as codigoArtefacto,
           COALESCE(h.estado, 0) as estadoActual,
           CASE 
               WHEN COALESCE(h.estado, 0) = 0 THEN 'Aceptado'
               WHEN h.estado = 1 THEN 'Diagnosticado'
               WHEN h.estado = 2 THEN 'En espera de aprobación'
               WHEN h.estado = 3 THEN 'En espera de repuesto'
               WHEN h.estado = 4 THEN 'Reparado'
               WHEN h.estado = 5 THEN 'Sin solución'
               WHEN h.estado = 6 THEN 'Entregado'
               ELSE 'Aceptado'
           END as estadoTexto,
           h.fechaCambio as ultimaActualizacion,
           h.descripcion as ultimaDescripcion
    FROM caso c
    INNER JOIN artefacto a ON c.idArtefacto = a.id OR c.idArtefacto = a.serie
    LEFT JOIN (
        SELECT idCaso, estado, fechaCambio, descripcion
        FROM historialCaso h1 
        WHERE h1.idCaso = _idCaso 
        AND h1.fechaCambio = (
            SELECT MAX(h2.fechaCambio) 
            FROM historialCaso h2 
            WHERE h2.idCaso = _idCaso
        )
        AND h1.id = (
            SELECT MAX(h3.id) 
            FROM historialCaso h3 
            WHERE h3.idCaso = _idCaso 
            AND h3.fechaCambio = (
                SELECT MAX(h4.fechaCambio) 
                FROM historialCaso h4 
                WHERE h4.idCaso = _idCaso
            )
        )
    ) h ON c.id = h.idCaso
    WHERE c.id = _idCaso;
END$$

-- Cambiar estado de caso (para POST /caso/estado/{codigo})
DROP FUNCTION IF EXISTS cambiarEstadoCaso$$
CREATE FUNCTION cambiarEstadoCaso (
    _idCaso INT,
    _nuevoEstado INT,
    _idResponsable VARCHAR(15),
    _descripcion VARCHAR(255))
RETURNS INT(1)
BEGIN
    DECLARE _cant INT;
    
    -- Verificar que el caso existe
    SELECT COUNT(id) INTO _cant FROM caso WHERE id = _idCaso;
    IF _cant = 0 THEN
        RETURN 0; -- Caso no existe
    END IF;
    
    -- Verificar que el responsable existe (buscar en tabla usuario)
    SELECT COUNT(idUsuario) INTO _cant FROM usuario WHERE idUsuario = _idResponsable;
    IF _cant = 0 THEN
        RETURN 2; -- Responsable no existe
    END IF;
    
    -- Verificar que el estado es válido (0-6)
    IF _nuevoEstado < 0 OR _nuevoEstado > 6 THEN
        RETURN 1; -- Estado inválido
    END IF;
    
    -- Agregar entrada al historial
    INSERT INTO historialCaso(idCaso, idResponsable, estado, fechaCambio, descripcion)
    VALUES (_idCaso, _idResponsable, _nuevoEstado, CURDATE(), _descripcion);
    
    -- Si el estado es "Entregado" (6), actualizar fechaSalida del caso
    IF _nuevoEstado = 6 THEN
        UPDATE caso SET fechaSalida = CURDATE() WHERE id = _idCaso;
    END IF;
    
    RETURN 0; -- Éxito
END$$

-- Obtener casos por cliente (para GET /caso/cliente/{id})
DROP PROCEDURE IF EXISTS obtenerCasosPorCliente$$
CREATE PROCEDURE obtenerCasosPorCliente (
    _idCliente VARCHAR(15),
    _parametros VARCHAR(250), -- %codigo%&%idTecnico%&%idArtefacto%&%descripcion%&
    _pagina SMALLINT UNSIGNED, 
    _cantRegs SMALLINT UNSIGNED
)
BEGIN
    SELECT cadenaFiltro(_parametros, 'codigo&idTecnico&idArtefacto&descripcion&') INTO @filtro;
    -- Reemplazar 'codigo' con 'id' para la consulta SQL
    SELECT REPLACE(@filtro, 'codigo', 'id') INTO @filtro;

    IF @filtro IS NULL OR TRIM(@filtro) = '' THEN
        SELECT CONCAT(
            "SELECT c.* FROM caso c INNER JOIN artefacto a ON c.idArtefacto = a.serie ",
            "WHERE a.idCliente = '", _idCliente, "' ",
            "ORDER BY c.fechaEntrada DESC LIMIT ", _pagina, ", ", _cantRegs
        ) INTO @sql;
    ELSE
        SELECT CONCAT(
            "SELECT c.* FROM caso c INNER JOIN artefacto a ON c.idArtefacto = a.serie ",
            "WHERE a.idCliente = '", _idCliente, "' AND ", @filtro, " ",
            "ORDER BY c.fechaEntrada DESC LIMIT ", _pagina, ", ", _cantRegs
        ) INTO @sql;
    END IF;

    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

-- Obtener casos por técnico
DROP PROCEDURE IF EXISTS obtenerCasosPorTecnico$$
CREATE PROCEDURE obtenerCasosPorTecnico (
    _idTecnico VARCHAR(15),
    _parametros VARCHAR(250), -- %codigo%&%idTecnico%&%idArtefacto%&%descripcion%&
    _pagina SMALLINT UNSIGNED, 
    _cantRegs SMALLINT UNSIGNED
)
BEGIN
    SELECT cadenaFiltro(_parametros, 'codigo&idTecnico&idArtefacto&descripcion&') INTO @filtro;
    -- Reemplazar 'codigo' con 'id' para la consulta SQL
    SELECT REPLACE(@filtro, 'codigo', 'id') INTO @filtro;

    IF @filtro IS NULL OR TRIM(@filtro) = '' THEN
        SELECT CONCAT(
            "SELECT * FROM caso WHERE idTecnico = '", _idTecnico, "' ",
            "ORDER BY fechaEntrada DESC LIMIT ", _pagina, ", ", _cantRegs
        ) INTO @sql;
    ELSE
        SELECT CONCAT(
            "SELECT * FROM caso WHERE idTecnico = '", _idTecnico, "' AND ", @filtro, " ",
            "ORDER BY fechaEntrada DESC LIMIT ", _pagina, ", ", _cantRegs
        ) INTO @sql;
    END IF;

    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$


-- Obtener historial completo de un caso
DROP PROCEDURE IF EXISTS obtenerHistorialCaso$$
CREATE PROCEDURE obtenerHistorialCaso (_idCaso INT)
BEGIN
    SELECT h.*, 
           CASE 
               WHEN h.estado = 0 THEN 'Aceptado'
               WHEN h.estado = 1 THEN 'Diagnosticado'
               WHEN h.estado = 2 THEN 'En espera de aprobación'
               WHEN h.estado = 3 THEN 'En espera de repuesto'
               WHEN h.estado = 4 THEN 'Reparado'
               WHEN h.estado = 5 THEN 'Sin solución'
               WHEN h.estado = 6 THEN 'Entregado'
               ELSE 'Estado desconocido'
           END as estadoTexto
    FROM historialCaso h
    WHERE h.idCaso = _idCaso
    ORDER BY h.fechaCambio DESC, h.id DESC;
END$$

DELIMITER ;