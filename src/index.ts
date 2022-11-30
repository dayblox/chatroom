import { WebSocketServer } from "ws"
import { heartbeat, keepAlive } from "./utils/keepalive.js"
import { ask } from "./utils/log.js"
import {
	close,
	chooseNickname,
	chooseRoom,
	broadcastMessage,
} from "./utils/message.js"
import { newState, Socket } from "./utils/state.js"

const wss = new WebSocketServer({ port: Number(process.env.PORT) })

wss.on("connection", (ws: Socket) => {
	const state = newState(ws)
	ask(ws, "Room Code")

	ws.on("message", (data) => {
		const message = data.toString()

		switch (state.status) {
			case "ROOM":
				return chooseRoom(message, state)
			case "NICKNAME":
				return chooseNickname(message, state)
			default:
				return broadcastMessage(message, state)
		}
	})

	ws.on("pong", heartbeat)
	ws.on("close", () => close(state))
})

const interval = keepAlive(wss)
wss.on("close", () => clearInterval(interval))
