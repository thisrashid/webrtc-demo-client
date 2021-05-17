import React from "react";
import { useAppContext } from "../../utils/AppContext";
import VideoCall from "../VideoCall/VideoCall";
import styles from "./UserList.module.scss";

type UserListProps = {
  user?: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
};
const UserList: React.FC<UserListProps> = ({
  user,
  onCallEnd,
  onCallStart,
}) => {
  const [selectedUser, setSelectedUser] = React.useState("");
  const { state } = useAppContext();

  const callUser = React.useCallback(
    (event: React.SyntheticEvent<HTMLLIElement>) => {
      const currentUser = event.currentTarget.dataset.name;
      if (currentUser && state.username !== currentUser) {
        console.log("Call user: ", currentUser);
        setSelectedUser(currentUser);
        onCallStart && onCallStart();
      }
    },
    [state.username, onCallStart]
  );

  const handleCallEnd = React.useCallback(() => {
    setSelectedUser("");
    onCallEnd && onCallEnd();
    console.log("Call ended");
  }, [onCallEnd]);

  React.useEffect(() => {
    setSelectedUser(user || "");
  }, [user]);

  if (selectedUser) {
    return (
      <VideoCall
        target={selectedUser}
        join={!!user}
        onCallEnd={handleCallEnd}
      />
    );
  }

  return (
    <ul className={styles.UserList} data-testid="UserList">
      {state.users.map((user, index) => (
        <li key={index} data-name={user} onClick={callUser}>
          {user}
        </li>
      ))}
    </ul>
  );
};
export default UserList;
