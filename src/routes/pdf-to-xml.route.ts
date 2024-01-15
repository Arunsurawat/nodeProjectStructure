import { Router } from 'express';
import { Routes } from '@interfaces/route.interface';
import UserController from '@controllers/user.controller';
import { logger } from '@utils/logger';
import PdfToXmlController from '@/controllers/pdf-to-xml.controller';
import fileUpload from 'express-fileupload';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})


// Set up Multer for file uploads
const upload = multer({ storage: storage })

class PdfToXmlRoute implements Routes {
    public path = '/pdf-to-xml/';
    public router = Router();
    public pdf_to_xml_controller = new PdfToXmlController();
    constructor() {
        logger.info(`/pdf-to-xml/`)
        this.initializeRoutes();
    }
 

    private initializeRoutes() {
        this.router.post(`${this.path}convert`, upload.single("file"), this.pdf_to_xml_controller.convertXml);
        this.router.post(`${this.path}create`, upload.single("file"), this.pdf_to_xml_controller.createXml);
        this.router.get(`${this.path}`, this.pdf_to_xml_controller.viewXml);
    }
}

export default PdfToXmlRoute;