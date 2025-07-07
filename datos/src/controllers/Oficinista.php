<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;
use PDO;
use PDOException;
use Slim\Psr7\Stream;

class Oficinista extends Persona {
    protected $container;
    private const ROL = 2; // ID del rol para Oficinista
    private const RECURSO = "Oficinista"; // Recurso para el oficinista
    public function __construct(ContainerInterface $c){
        $this->container = $c;
    }

    public function read(Request $request, Response $response, $args){
        $sql = "SELECT * FROM vista_oficinistas ";
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

    public function create(Request $request, Response $response, $args){
        $body = json_decode($request->getBody()->getContents());

        if (!$body || !isset(
            $body->idOficinista, $body->nombre, $body->apellido1,
            $body->apellido2, $body->telefono, $body->celular,
            $body->direccion, $body->correo
        )) {
            $stream = new Stream(fopen('php://temp', 'r+'));
            $stream->write(json_encode(['error' => 'Datos incompletos o mal formateados.']));
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus(400)
                ->withBody($stream);
        }

        $sql = "CALL nuevoOficinista(:idOficinista, :nombre, :apellido1, :apellido2, :telefono, :celular, :direccion, :correo, :passw);";
        
        try {
            $con = $this->container->get('base_datos');
            $query = $con->prepare($sql);

            $passw = password_hash($body->idOficinista, PASSWORD_DEFAULT);

            $query->bindValue(':idOficinista', $body->idOficinista);
            $query->bindValue(':nombre', $body->nombre);
            $query->bindValue(':apellido1', $body->apellido1);
            $query->bindValue(':apellido2', $body->apellido2);
            $query->bindValue(':telefono', $body->telefono);
            $query->bindValue(':celular', $body->celular);
            $query->bindValue(':direccion', $body->direccion);
            $query->bindValue(':correo', $body->correo);
            $query->bindValue(':passw', $passw);

            $query->execute();
            $status = 201;

        } catch(PDOException $e) {
            $status = 500;
        }

        $query = null;
        $con = null;

        return $response->withStatus($status);
    }

    public function update(Request $request, Response $response, $args){
      
            $body= json_decode($request->getBody(), 1);
            $status= $this-> updateP(self::RECURSO, $body, $args['id']);
            return $response ->withStatus($status);
        }

    public function delete(Request $request, Response $response, $args){
        $sql = "CALL eliminarOficinista(:id);";

        try {
            $con = $this->container->get('base_datos');
            $query = $con->prepare($sql);
            $query->bindValue(':id', $args['id'], PDO::PARAM_INT);
            $query->execute();

            $status = 200;

        } catch (PDOException $e) {
            $status = 500;
        }

        $query = null;
        $con = null;

        return $response->withStatus($status);
    }

    public function filtrar(Request $request, Response $response, $args) {
    $datos = $request->getQueryParams();
    $filtro = "%";
    foreach ($datos as $key => $value) {
        $filtro .= "$value%&%";
    }
    $filtro = substr($filtro, 0, -1); // Elimina el último '%'

    $sql = "CALL filtrarOficinistas('$filtro', {$args['pag']}, {$args['lim']});";
    
    try {
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);
        $query->execute();
        $res = $query->fetchAll();
        $status = $query->rowCount() > 0 ? 200 : 204;

        $response->getBody()->write(json_encode($res));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);

    } catch (PDOException $e) {
        $response->getBody()->write(json_encode([
            'error' => 'Error al filtrar oficinistas',
            'message' => $e->getMessage()
        ]));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(500);
    } finally {
        $query = null;
        $con = null;
    }
}
    public function buscar(Request $request, Response $response, $args){
             $resp = $this->buscarOficinista(self::RECURSO, (int)$args['id']);
            $response->getbody()->write(json_encode($resp['datos']));
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus($resp['status']);
        }
}
