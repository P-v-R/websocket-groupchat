/** Functionality related to chatting. */

// Room is an abstraction of a chat channel
const Room = require("./Room");

/** ChatUser is a individual connection from client -> server to chat. */

class ChatUser {
  /** Make chat user: store connection-device, room.
   *
   * @param send {function} callback to send message to this user
   * @param room {Room} room user will be in
   * */

  constructor(send, roomName) {
    this._send = send; // "send" function for this user
    this.room = Room.get(roomName); // room user will be in
    this.name = null; // becomes the username of the visitor

    console.log(`created chat in ${this.room.name}`);
  }

  /** Send msgs to this client using underlying connection-send-function.
   *
   * @param data {string} message to send
   * */

  send(data) {
    try {
      this._send(data);
    } catch {
      // If trying to send to a user fails, ignore it
    }
  }

  /** Handle joining: add to room members, announce join.
   *
   * @param name {string} name to use in room
   * */

  handleJoin(name) {
    this.name = name;
    this.room.join(this);
    this.room.broadcast({
      type: "note",
      text: `${this.name} joined "${this.room.name}".`,
    });
  }

  /** Handle a chat: broadcast to room.
   *
   * @param text {string} message to send
   * */

  handleChat(text) {
    this.room.broadcast({
      name: this.name,
      type: "chat",
      text: text,
    });
  }

  /** Handle messages from client:
   *
   * @param jsonData {string} raw message data
   *
   * @example<code>
   * - {type: "join", name: username} : join
   * - {type: "chat", text: msg }     : chat
   * </code>
   */

  handleMessage(jsonData) {
    let msg = JSON.parse(jsonData);

    if (msg.type === "join") this.handleJoin(msg.name);
    else if (msg.type === "chat") this.handleChat(msg.text);
    else if (msg.type === "joke") this.handleJoke()
    else if (msg.type === "members") this.handleMembers(msg)
    else if (msg.type === "priv") this.handlePriv(msg)
    else throw new Error(`bad message: ${msg.type}`);
  }


  /** when user asks for (/joke) respond with a random joke */
  handleJoke() {
    let joke = { name: "jokeBOT", type: "chat", text: "WHY did the chicken cross the road??????????" }
    this.send(JSON.stringify(joke))
  }

  /** when user asks for (/joke) respond with a random joke */
  handleMembers() {
    let members = [];
    for (let member of this.room.members) {
      members.push(member.name);
    }
    let msg = `In room: ${members.join(', ')}.`;

    let data = { name: "ChatBot", type: "chat", text: msg }
    this.send(JSON.stringify(data))
  }
  
  /** when user asks for (/joke) respond with a random joke */
  handleMembers() {
    let members = [];
    for (let member of this.room.members) {
      members.push(member.name);
    }
    let msg = `In room: ${members.join(', ')}.`;

    let data = { name: "ChatBot", type: "chat", text: msg }
    this.send(JSON.stringify(data))
  }
  /** when user asks for (/joke) respond with a random joke */
  handlePriv(msg) {
    // let members = [];
    // for (let member of this.room.members) {
    //   members.push(member.name);
    // }
    // let msg = `In room: ${members.join(', ')}.`;

    // let data = { name: "ChatBot", type: "chat", text: msg }
    // this.send(JSON.stringify(data))
  }


  /** Connection was closed: leave room, announce exit to others. */

  handleClose() {
    this.room.leave(this);
    this.room.broadcast({
      type: "note",
      text: `${this.name} left ${this.room.name}.`,
    });
  }
}

module.exports = ChatUser;
