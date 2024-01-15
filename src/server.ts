import App from "./app";
import IndexRoute from "@routes/index.route";
import UserRoute from "@routes/user.route";
import TodosRoute from "@routes/todos.route";
import PdfToXmlRoute from "@routes/pdf-to-xml.route";


const app = new App([
    new IndexRoute(),
    new UserRoute(),
    new TodosRoute(),
    new PdfToXmlRoute()
]);


app.listen();