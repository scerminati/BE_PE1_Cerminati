# Backend I - Pre Entrega 1 - Sofía Cerminati

Este proyecto cumple con las especificaciones requeridas según las rúbricas establecidas. 

## Servidor

El servidor está configurado para ejecutarse en *localhost* en el puerto *8080*.


## Routers

La aplicación cuenta con dos routers, *products* y *carts*. *Products* contiene los métodos **GET**, **POST**, **PUT** y **DELETE**, mientras que *carts* tiene solamente los métodos **GET**, **POST** y **PUT**. Para acceder a los métodos de productos, se debe ir a la ruta **/api/products**, consecuentemente el de carts es **/api/carts/**.

## File System 

Se tienen dos archivos .json en la carpeta ./json, *products.json*, el cual cuenta con 48 productos con los respectivos ids, título, código, descripción, status, stock, categoría y thumbnail; y *carts.json*, que comienza con un array vacío. A medida que se ejecuten los métodos en la aplicación, ambos archivos se leerán y se actualizarán según corresponda. 

## Métodos

### Products

- **GET**: El método me permite obtener el listado completo de los productos con todo su detalle. Si se especifica un id, **/api/products/*id***, el método mostrará el producto con dicho id si existe tal. Asímismo, al especificar un límite como pedido con **/api/products/?limit=*X***, se devuelve el listado de productos limitados en cantidad X.

- **POST**: El método me permite agregar un nuevo producto. El id del nuevo producto se define solo, de manera de no repetirse con ninguno de los anteriores. El método también toma como obligatorios los campos de título, código, descripción, stock, y categoría, así como también el tipo de dato que se ingresa. Si stock pasa a tener un valor de 0, el status se añadirá al producto como *false*, de lo contrario, siempre será *true*. En cuanto a thumbnail, espera recibir un string, pero el ingreso de dicho dato no es necesario. En caso de no recibirlo o recibir otro tipo de dato (como numérico), se completará como un string vacío. Una vez realizado el método, se actualiza el archivo en la carpeta json. El método debe ejecutarse en la raíz de la api, **/api/products/**.

- **PUT**: Este método me permite modificar cualquiera de los productos que se encuentran en la base de datos especificando el id del mismo mediante **/api/products/*id***. El método buscará los datos a cambiar y solo cambiará los mismos, sin necesidad de volver a escribir todo el producto, o lo que se desea dejar igual. En caso que el producto no exista, devolverá un error *404*.

- **DELETE**: El método busca el producto mediante la especificación del id **/api/products/*id***, y elimina el producto del array, actualiza el archivo al hacerlo.

### Carts

- **GET**: El método me permite obtener el listado completo de los carritos el detalle de id y los productos dentro de ellos, especificando id y cantidad. Si se especifica un id, **/api/carts/*id***, el método mostrará el carrito con dicho id si existe tal. Asímismo, al especificar un límite como pedido con **/api/carts/?limit=*X***, se devuelve el listado de carritos limitados en cantidad X.

- **POST**: El método debe correrse en la raiz **/api/carts**, y se generará un nuevo carrito con un id asignado automáticamente. El mismo se guardará en el archivo .json, y generará el array de productos vacíos para luego ser añadidos.

- **PUT**: El método necesita dos parámetros, el id del carrito, y el id del producto a agregar. Se debe ejecutar en la ruta **/api/carts/*idCarrito*/product/*idProducto***, ambos ids deben ser válidos y existir en los arrays correspondientes. Si tanto el id como el producto existen, se chequea primero que el status del producto sea ***true***, lo cual implica que hay stock disponible. En caso de que sea falso, se arroja un error *404*. Si hay stock, se agrega a cantidades del producto de a 1, generando un nuevo objeto de producto con el id del producto en caso de que no exista, y sumando una cantidad de 1 si ya existe. A medida que se agregan productos, se van descontando del array de productos la misma cantidad en stock. En caso que el stock llega a 0, el método arroja un error *404* avisando que no hay más stock para agregar.

