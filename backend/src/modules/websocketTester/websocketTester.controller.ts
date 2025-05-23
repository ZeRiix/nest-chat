import { Controller, Get, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

@ApiTags("WebSocket Tester")
@Controller("websocket-tester")
export class WebsocketTesterController {
	@Get()
	public getTestPage(@Res() res: Response) {
		return void res.sendFile(path.join(__dirname, "static", "index.html"));
	}
}
