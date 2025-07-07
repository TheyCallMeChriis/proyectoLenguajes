USE taller;
SET GLOBAL log_bin_trust_function_creators = 1;
DELIMITER $$

DROP PROCEDURE IF EXISTS buscarArtefacto$$
CREATE PROCEDURE buscarArtefacto (_id int)
begin
    select * from artefacto where id = _id;
end$$

DROP PROCEDURE IF EXISTS filtrarArtefacto$$
CREATE PROCEDURE filtrarArtefacto (
    _parametros varchar(100), -- %serie%&%modelo%&%marca%&%categoria%&
    _pagina SMALLINT UNSIGNED, 
    _cantRegs SMALLINT UNSIGNED)
begin
    SELECT cadenaFiltro(_parametros, 'serie&modelo&marca&categoria&') INTO @filtro;
    SELECT concat("SELECT * from artefacto where ", @filtro, " LIMIT ", 
        _pagina, ", ", _cantRegs) INTO @sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;  
end$$

DROP PROCEDURE IF EXISTS numRegsArtefacto$$
CREATE PROCEDURE numRegsArtefacto (
    _parametros varchar(100))
begin
    declare _cant int;
    SELECT cadenaFiltro(_parametros, 'serie&modelo&marca&categoria&') INTO @filtro;
    SELECT concat("SELECT count(id) from artefacto where ", @filtro) INTO @sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
end$$

DROP FUNCTION IF EXISTS nuevoArtefacto;

DELIMITER $$
CREATE FUNCTION nuevoArtefacto (
    _idCliente INT(11),
    _serie VARCHAR(15),
    _modelo VARCHAR(15),
    _marca VARCHAR(15),
    _categoria VARCHAR(15),
    _descripcion VARCHAR(50)
) RETURNS INT(1)
BEGIN
    DECLARE _cant INT;

    SELECT COUNT(*) INTO _cant FROM artefacto WHERE serie = _serie;

    IF _cant < 1 THEN
        
        SELECT COUNT(*) INTO _cant FROM cliente WHERE idCliente = _idCliente;

        IF _cant > 0 THEN
            INSERT INTO artefacto(idCliente, serie, modelo, marca, categoria, descripcion)
            VALUES (_idCliente, _serie, _modelo, _marca, _categoria, _descripcion);
            SET _cant = 0;
        ELSE
            SET _cant = 2; 
        END IF;
    END IF;

    RETURN _cant;
END$$
DELIMITER ;

DROP FUNCTION IF EXISTS editarArtefacto$$
CREATE FUNCTION editarArtefacto (
    _id int, 
    _serie VARCHAR(15),
    _modelo VARCHAR(15),
    _marca VARCHAR(15),
    _categoria VARCHAR(15),
    _descripcion VARCHAR(50)
    ) RETURNS INT(1) 
begin
    declare _cant int;
    select count(id) into _cant from artefacto where id = _id;
    if _cant > 0 then
        -- select count(id) into _cant from artefacto where serie = _serie and id <> _id;
        -- if _cant = 0 then
            update artefacto set
                serie = _serie,
                modelo = _modelo,
                marca = _marca,
                categoria = _categoria,
                descripcion = _descripcion
            where id = _id;
        --    set _cant = 1;
        -- else
        --     set _cant = 2;
       -- end if;
    end if;
    return _cant;
end$$

DROP FUNCTION IF EXISTS eliminarArtefacto$$
CREATE FUNCTION eliminarArtefacto (_id INT(1)) RETURNS INT(1)
begin
    declare _cant int;
    declare _resp int;
    SELECT 0 into _resp;
    select count(id) into _cant from Artefacto where id = _id;
    if _cant > 0 then
        select _cant into _resp;
        select count(idArtefacto) into _cant from caso where idArtefacto = _id;
        if _cant = 0 then
            delete from artefacto where id = _id;
        else 
            select 2 into _resp;
        end if;
    end if;
    return _resp;
end$$

DELIMITER ;
