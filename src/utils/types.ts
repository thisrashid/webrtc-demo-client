export type Message = {
  text: string;
  type: "message" | "username";
  id?: number;
  username: string;
  date: number;
};
