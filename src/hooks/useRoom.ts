import { useContext } from "react";
import { RoomContext } from "../context/RoomContext";

export const useRoom = () => useContext(RoomContext);
