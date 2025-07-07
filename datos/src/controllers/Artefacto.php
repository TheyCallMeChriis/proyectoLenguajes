<?php
    namespace App\controllers;

    use Psr\Http\Message\ResponseInterface as Response;
    use Psr\Http\Message\ServerRequestInterface as Request;
    use Psr\Container\ContainerInterface;

    use PDO;

    class Artefacto{
        protected $container;
       // private const RECURSO = "Artefacto"; // Recurso para el artefact
        public function __construct(ContainerInterface $c){
            $this->container = $c;
        }

        public function read(Request $request, Response $response, $args){
            $sql= "SELECT * FROM artefacto ";


           
            if(isset($args['id'])){
                $sql.="WHERE id = :id ";
                
            }

            $sql .=" LIMIT 0,5;";
            $con=  $this->container->get('base_datos');
            $query = $con->prepare($sql);

            if(isset($args['id'])){
                $query->execute(['id' => $args['id']]);
            }else{
                $query->execute();
            }
            
            $res= $query->fetchAll();

            $status= $query->rowCount()> 0 ? 200 : 204;

            $query=null;
            $con=null;


            $response->getbody()->write(json_encode($res));


            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus($status);
        }

        public function create(Request $request, Response $response, $args){
            
            $body= json_decode($request->getBody());

            $sql = "SELECT nuevoArtefacto(:idCliente, :serie, :modelo, :marca, :categoria, :descripcion);";

            $con=  $this->container->get('base_datos');
            $con->beginTransaction();
            $query = $con->prepare($sql);



            
            foreach($body as $key => $value){
                $TIPO= gettype($value)=="integer" ? PDO::PARAM_INT : PDO::PARAM_STR;

                $value=filter_var($value, FILTER_SANITIZE_SPECIAL_CHARS);

                $query->bindValue(':'.$key, $value, $TIPO);
            };

            try{
                $query->execute();
                $con->commit();
                $res= $query->fetch(PDO::FETCH_NUM)[0];
                $status= match($res) {
                    0 => 201,
                    1 => 409,
                    2 => 428
                };

            } catch(PDOException $e){
                $status= 500;
                $con->rollBack();
            }

            $query=null;
            $con=null;


            return $response ->withStatus($status);
        }

        public function update(Request $request, Response $response, $args) {
    $body = json_decode($request->getBody(), true);

    $sql = "SELECT editarArtefacto(:id, :serie, :modelo, :marca, :categoria, :descripcion);";

    $con = $this->container->get('base_datos');
    $con->beginTransaction();
    $query = $con->prepare($sql);

    try {
        $query->bindValue(':id', $args['id'], PDO::PARAM_INT);
        $query->bindValue(':serie', filter_var($body['serie'], FILTER_SANITIZE_SPECIAL_CHARS), PDO::PARAM_STR);
        $query->bindValue(':modelo', filter_var($body['modelo'], FILTER_SANITIZE_SPECIAL_CHARS), PDO::PARAM_STR);
        $query->bindValue(':marca', filter_var($body['marca'], FILTER_SANITIZE_SPECIAL_CHARS), PDO::PARAM_STR);
        $query->bindValue(':categoria', filter_var($body['categoria'], FILTER_SANITIZE_SPECIAL_CHARS), PDO::PARAM_STR);
        $query->bindValue(':descripcion', filter_var($body['descripcion'], FILTER_SANITIZE_SPECIAL_CHARS), PDO::PARAM_STR);

        $query->execute();
        $res = $query->fetch(PDO::FETCH_NUM)[0];

        $status = match ($res) {
            0 => 200, // ✅ Actualizado
            1 => 404, // ❌ ID no existe
            default => 500 // ⚠️ Fallo desconocido
        };

        $con->commit();
    } catch (\PDOException $e) {
        $con->rollBack();
        $status = ($e->getCode() === '23000') ? 409 : 500;
    }

    $query = null;
    $con = null;

    return $response->withStatus($status);
}


        public function delete(Request $request, Response $response, $args){
            

            $sql = "SELECT eliminarArtefacto(:id);";
            $con=  $this->container->get('base_datos');

            $query = $con->prepare($sql);
 
            $query->bindValue('id', $args['id'], PDO::PARAM_INT);
            $query->execute();
              
            $resp= $query->fetch(PDO::FETCH_NUM)[0];
            
            $status= $resp > 0 ? 200 : 404;
 
            $query=null;
            $con=null;
 
            return $response ->withStatus($status);
        }

        public function filtrar(Request $request, Response $response, $args){
            // %serie%&%modelo%&%marca%&%categoria%&

            $datos= $request->getQueryParams();
            $filtro= "%";
            foreach($datos as $key => $value){
                $filtro .= "$value%&%";
            }
            $filtro= substr($filtro, 0, -1);

            $sql="CALL filtrarArtefacto('$filtro', {$args['pag']},{$args['lim']});";

            $con=  $this->container->get('base_datos');
            $query = $con->prepare($sql);

            //die($sql);

            $query->execute();
            
            $res= $query->fetchAll();

            $status= $query->rowCount()> 0 ? 200 : 204;

            $query=null;
            $con=null;


            $response->getbody()->write(json_encode($res));


            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus($status);
        }


      public function buscar(Request $request, Response $response, $args){
            $resp= $this->buscarP(self::RECURSO,$args['id']);
            $response->getbody()->write(json_encode($resp['datos']));
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus($resp['status']);
        }  

    }
