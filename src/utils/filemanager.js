import fs from "fs";

export const fileManager = async (fileName, save, array) => {
  let path;
  let data;

  if (fileName === "products") {
    path = "src/json/products.json";
  } else if (fileName === "carts") {
    path = "src/json/carts.json";
  }

  if (save) {
    try {
      await fs.promises.writeFile(path, JSON.stringify(array, null, 2));
      console.log(`Archivo ${fileName}.json guardado correctamente.`);
    } catch (error) {
      console.error(error, `No se pudo guardar el archivo ${fileName}.json.`);
    }
  } else {
    try {
      const fileContent = await fs.promises.readFile(path, "utf8");

      data = JSON.parse(fileContent);
      return data;
    } catch (error) {
      console.error(error, `No se pudo leer el archivo ${fileName}.json.`);
      try {
        await fs.promises.writeFile(path, JSON.stringify([], null, 2));
        console.log(
          `Archivo ${fileName}.json creado correctamente con un array vacío.`
        );
      } catch (error) {
        console.error(error, `No se pudo crear el archivo ${fileName}.json.`);
      }
    }
  }
};

export function getNextId(array) {
  if (array.length === 0) {
    return 1;
  } else {
    const largo = array.length;
    const ultimoId = Math.max(...array.map((ult) => ult.id));
    const maxId = largo >= ultimoId ? largo : ultimoId;

    return maxId + 1;
  }
}
