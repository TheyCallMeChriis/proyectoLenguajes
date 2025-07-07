USE taller;
DELIMITER $$

CREATE OR REPLACE VIEW vista_tecnicos AS
SELECT
    t.id,
    t.idTecnico,
    t.nombre,
    t.apellido1,
    t.apellido2,
    t.telefono,
    t.celular,
    t.direccion,
    u.correo,
    u.rol
FROM tecnico t
JOIN usuario u ON t.idTecnico = u.idUsuario;
$$

DROP PROCEDURE IF EXISTS nuevoTecnico$$
CREATE PROCEDURE nuevoTecnico (
    _idTecnico VARCHAR(15),
    _nombre VARCHAR(30),
    _apellido1 VARCHAR(15),
    _apellido2 VARCHAR(15),
    _telefono VARCHAR(9),
    _celular VARCHAR(9),
    _direccion VARCHAR(255),
    _correo VARCHAR(100),
    _passw VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'Error: No se pudo crear el técnico.' AS Resultado;
    END;

    START TRANSACTION;
    INSERT INTO usuario(idUsuario, correo, rol, passw) VALUES (_idTecnico, _correo, 3, _passw);
    INSERT INTO tecnico(idTecnico, nombre, apellido1, apellido2, telefono, celular, direccion, correo) VALUES (_idTecnico, _nombre, _apellido1, _apellido2, _telefono, _celular, _direccion, _correo);
    COMMIT;
    SELECT 'Técnico creado con éxito.' AS Resultado;
END$$

DROP PROCEDURE IF EXISTS eliminarTecnico$$
CREATE PROCEDURE eliminarTecnico (_id_tecnico INT)
BEGIN
    DECLARE _idUsuarioABorrar VARCHAR(15);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'Error: No se pudo eliminar el técnico.' AS Resultado;
    END;

    START TRANSACTION;
    SELECT idTecnico INTO _idUsuarioABorrar FROM tecnico WHERE id = _id_tecnico;
    IF _idUsuarioABorrar IS NOT NULL THEN
        DELETE FROM tecnico WHERE id = _id_tecnico;
        DELETE FROM usuario WHERE idUsuario = _idUsuarioABorrar;
        COMMIT;
        SELECT 'Técnico eliminado con éxito.' AS Resultado;
    ELSE
        ROLLBACK;
        SELECT 'Error: No se encontró un técnico con el ID proporcionado.' AS Resultado;
    END IF;
END$$

DROP PROCEDURE IF EXISTS editarTecnico$$
CREATE PROCEDURE editarTecnico (
    _id INT,
    _idTecnico VARCHAR(15),
    _nombre VARCHAR(30),
    _apellido1 VARCHAR(15),
    _apellido2 VARCHAR(15),
    _telefono VARCHAR(9),
    _celular VARCHAR(9),
    _direccion VARCHAR(255),
    _correo VARCHAR(100)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'Error: No se pudo editar el técnico.' AS Resultado;
    END;

    START TRANSACTION;
    UPDATE tecnico SET idTecnico = _idTecnico, nombre = _nombre, apellido1 = _apellido1, apellido2 = _apellido2, telefono = _telefono, celular = _celular, direccion = _direccion, correo = _correo WHERE id = _id;
    UPDATE usuario SET correo = _correo WHERE idUsuario = _idTecnico;
    COMMIT;
    SELECT 'Técnico actualizado con éxito.' AS Resultado;
END$$

DROP PROCEDURE IF EXISTS filtrarTecnicos$$
CREATE PROCEDURE filtrarTecnicos (
    IN _parametros VARCHAR(250),  -- %idTecnico%&%nombre%&%apellido1%&%correo%&
    IN _pagina SMALLINT UNSIGNED, 
    IN _cantRegs SMALLINT UNSIGNED
)
BEGIN
    DECLARE _filtro TEXT;

    -- Generar cláusula WHERE usando cadenaFiltro
    SELECT cadenaFiltro(_parametros, 'idTecnico&nombre&apellido1&correo&') INTO _filtro;

    -- Armar SQL dinámico
    SET @sql = CONCAT(
        'SELECT * FROM vista_tecnicos WHERE ', _filtro,
        ' LIMIT ', _pagina, ', ', _cantRegs
    );

    -- Ejecutar SQL dinámico
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

DELIMITER ;