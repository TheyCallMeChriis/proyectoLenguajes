<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Container\ContainerInterface;
use PDO;
use PDOException;

class Caso {
    protected $container;

    public function __construct(ContainerInterface $c){
        $this->container = $c;
    }

    public function read(Request $request, Response $response, $args){
        $sql = "SELECT * FROM vista_casos "; // La vista ya hace el trabajo complejo
        if(isset($args['id'])){
            $sql .= "WHERE id = :id";
        }
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);
        if(isset($args['id'])) $query->execute(['id' => $args['id']]);
        else $query->execute();
        
        $res = $query->fetchAll(PDO::FETCH_ASSOC);
        $status = $query->rowCount() > 0 ? 200 : 204;
        $response->getBody()->write(json_encode($res));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    public function create(Request $request, Response $response, $args){
        $body = json_decode($request->getBody());
        $sql = "CALL nuevoCaso(:idTecnico, :idCreador, :idArtefacto, :descripcion);";
        try {
            $con = $this->container->get('base_datos');
            $query = $con->prepare($sql);
            $query->bindValue(':idTecnico', $body->idTecnico);
            $query->bindValue(':idCreador', $body->idCreador);
            $query->bindValue(':idArtefacto', $body->idArtefacto, PDO::PARAM_INT);
            $query->bindValue(':descripcion', $body->descripcion);
            $query->execute();
            $status = 201;
        } catch(PDOException $e) {
            $status = 500;
        }
        return $response->withStatus($status);
    }

    public function update(Request $request, Response $response, $args) {
        $body = json_decode($request->getBody());
        $sql = "CALL editarCaso(:id, :idTecnico, :descripcion);";
        try {
            $con = $this->container->get('base_datos');
            $query = $con->prepare($sql);
            $query->bindValue(':id', $args['id'], PDO::PARAM_INT);
            $query->bindValue(':idTecnico', $body->idTecnico);
            $query->bindValue(':descripcion', $body->descripcion);
            $query->execute();
            $status = $query->rowCount() > 0 ? 200 : 404;
        } catch (PDOException $e) {
            $status = 500;
        }
        return $response->withStatus($status);
    }

    public function delete(Request $request, Response $response, $args){
        $sql = "CALL eliminarCaso(:id);";
        try {
            $con = $this->container->get('base_datos');
            $query = $con->prepare($sql);
            $query->bindValue(':id', $args['id'], PDO::PARAM_INT);
            $query->execute();
            $status = $query->rowCount() > 0 ? 200 : 404;
        } catch(PDOException $e){
            $status = 500;
        }
        return $response->withStatus($status);
    }

       public function filtrar(Request $request, Response $response, $args){
    $params = $request->getQueryParams();

    $offset = isset($args['inicio']) ? (int)$args['inicio'] : 0;
    $limit = isset($args['cantidad']) ? (int)$args['cantidad'] : 10;

    $id = !empty($params['id']) ? $params['id'] : null;
    $nombre = !empty($params['nombre_cliente']) ? $params['nombre_cliente'] : null;
    $marca = !empty($params['marca_artefacto']) ? $params['marca_artefacto'] : null;
    $estado = !empty($params['estado_actual']) ? $params['estado_actual'] : null;

    try {
        $sql = "CALL filtrarCasos(:id, :nombre_cliente, :marca_artefacto, :estado_actual, :offset, :limit)";
        $stmt = $this->container->get('base_datos')->prepare($sql);

        $stmt->bindValue(':id', $id, is_null($id) ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindValue(':nombre_cliente', $nombre, is_null($nombre) ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindValue(':marca_artefacto', $marca, is_null($marca) ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindValue(':estado_actual', $estado, is_null($estado) ? PDO::PARAM_NULL : PDO::PARAM_STR);

        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);

        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode($data));
        return $response->withHeader('Content-Type', 'application/json');

    } catch (PDOException $e) {
        $error = ['error' => 'Error al filtrar casos', 'mensaje' => $e->getMessage()];
        $response->getBody()->write(json_encode($error));
        return $response
            ->withStatus(500)
            ->withHeader('Content-Type', 'application/json');
    }
}


    public function modificarEstado(Request $request, Response $response, $args) {
        $body = json_decode($request->getBody());
        $sql = "CALL cambiarEstadoCaso(:idCaso, :idResponsable, :nuevo_estado, :descripcion_cambio);";
        try {
            $con = $this->container->get('base_datos');
            $query = $con->prepare($sql);
            $query->bindValue(':idCaso', $args['id'], PDO::PARAM_INT);
            $query->bindValue(':idResponsable', $body->idResponsable, PDO::PARAM_STR);
            $query->bindValue(':nuevo_estado', $body->estado, PDO::PARAM_INT);
            $query->bindValue(':descripcion_cambio', $body->descripcion);
            $query->execute();
            $status = $query->rowCount() > 0 ? 200 : 404;
        } catch(PDOException $e) {
            $status = 500;
        }
        return $response->withStatus($status);
    }
}