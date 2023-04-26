import { INestApplication } from "@nestjs/common";
import { HttpExceptionFilter } from "../../http.exception-filter";

export function useGlobalFilters(app: INestApplication) {
  app.useGlobalFilters(new HttpExceptionFilter());
}
