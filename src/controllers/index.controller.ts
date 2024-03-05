import { NextFunction, Request, Response } from "express";
import path from 'path';

class IndexController {
  public index = (req: Request, res: Response, next: NextFunction) => {
    // try {
    //       res.status(200).send('./Views/mainContent.html')
    // } catch (error) {
    //   next(error);
    // }

    try {
      // Assuming mainContent.html is in the Views directory
      const filePath = path.join(__dirname, '../Views/mainContent.html');
      res.sendFile(filePath);
    } catch (error) {
        next(error);
    }
  };
}

export default IndexController;
