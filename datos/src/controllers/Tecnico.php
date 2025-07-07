<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;
use PDO;
use PDOException; // Importar PDOException para el manejo de errores

class Tecnico extends Persona {
    protected $container;
    private const ROL = 3; // ROL para Técnico
    private const RECURSO = "Tecnico"; // Recurso para el técnico
    public function __construct(ContainerInterface $c){
        $this->container = $c;
    }

    /**
     * Lee uno o todos los técnicos usando la vista.
     */
    public function read(Request $request, Response $response, $args){
        $sql = "SELECT * FROM vista_tecnicos ";
        if(isset($args['id'])){
            $sql .= "WHERE id = :id";
        }

        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);

        if(isset($args['id'])){
            $query->execute(['id' => $args['id']]);
        } else {
            $query->execute();
        }
        
        $res = $query->fetchAll();
        $status = $query->rowCount() > 0 ? 200 : 204;

        $response->getBody()->write(json_encode($res));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }

    /**
     * Crea un nuevo técnico y su usuario asociado.
     */
    public function create(Request $request, Response $response, $args){
        $body = json_decode($request->getBody());

        // CORREGIDO: Se elimina ':especialidad' de la llamada al procedimiento.
        $sql = "CALL nuevoTecnico(:idTecnico, :nombre, :apellido1, :apellido2, :telefono, :celular, :direccion, :correo, :passw);";
        
        try {
            $con = $this->container->get('base_datos');
            $query = $con->prepare($sql);

            $passw = $body->idTecnico; // Contraseña inicial es la cédula

            $query->bindValue(':idTecnico', $body->idTecnico);
            $query->bindValue(':nombre', $body->nombre);
            $query->bindValue(':apellido1', $body->apellido1);
            $query->bindValue(':apellido2', $body->apellido2);
            $query->bindValue(':telefono', $body->telefono);
            $query->bindValue(':celular', $body->celular);
            $query->bindValue(':direccion', $body->direccion);
            $query->bindValue(':correo', $body->correo);
            // CORREGIDO: Se elimina la línea que bindeaba ':especialidad'.
            $query->bindValue(':passw', password_hash($passw, PASSWORD_DEFAULT));

            $query->execute();
            $status = 201;

        } catch(PDOException $e) {
            $status = 500;
        }

        return $response->withStatus($status);
    }

    /**
     * Actualiza un técnico existente.
     */
    public function update(Request $request, Response $response, $args) {
        $body = json_decode($request->getBody());

        // CORREGIDO: Se elimina ':especialidad' de la llamada al procedimiento.
        $sql = "CALL editarTecnico(:id, :idTecnico, :nombre, :apellido1, :apellido2, :telefono, :celular, :direccion, :correo);";
        
        try {
            $con = $this->container->get('base_datos');
            $query = $con->prepare($sql);

            $query->bindValue(':id', $args['id'], PDO::PARAM_INT);
            $query->bindValue(':idTecnico', $body->idTecnico);
            $query->bindValue(':nombre', $body->nombre);
            $query->bindValue(':apellido1', $body->apellido1);
            $query->bindValue(':apellido2', $body->apellido2);
            $query->bindValue(':telefono', $body->telefono);
            $query->bindValue(':celular', $body->celular);
            $query->bindValue(':direccion', $body->direccion);
            $query->bindValue(':correo', $body->correo);
            // CORREGIDO: Se elimina la línea que bindeaba ':especialidad'.

            $query->execute();
            $status = $query->rowCount() > 0 ? 200 : 404;

        } catch (PDOException $e) {
            $status = 500;
        }

        return $response->withStatus($status);
    }

    /**
     * Elimina un técnico y su usuario asociado.
     */
    public function delete(Request $request, Response $response, $args){
        $sql = "CALL eliminarTecnico(:id);";

        try {
            $con = $this->container->get('base_datos');
            $query = $con->prepare($sql);
            $query->bindValue(':id', $args['id'], PDO::PARAM_INT);
            $query->execute();

            $status = $query->rowCount() > 0 ? 200 : 404;

        } catch (PDOException $e) {
            $status = 500;
        }

        return $response->withStatus($status);
    }

    /**
     * Filtra los técnicos con paginación.
     */
    public function filtrar(Request $request, Response $response, $args) {
        $datos = $request->getQueryParams();
        $filtro = "%";
            foreach ($datos as $key => $value) {
            $filtro .= "$value%&%";
        }
        $filtro = substr($filtro, 0, -1); 

        $sql = "CALL filtrarTecnicos('$filtro', {$args['pag']}, {$args['lim']});";

        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);
        $query->execute();

        $res = $query->fetchAll();
        $status = $query->rowCount() > 0 ? 200 : 204;

        $response->getBody()->write(json_encode($res));

        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
    public function buscar(Request $request, Response $response, $args){
        $resp = $this->buscarP(self::RECURSO, $args['id']);
        $response->getBody()->write(json_encode($resp['datos']));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($resp['status']);
    }
}