import React from 'react';
import {getRoomParticipants, removeParticipant, getRoomData, getUserInfo} from '../server';
import {Link, browserHistory} from 'react-router';

export default class RoomParticipants extends React.Component {

  constructor(props) {
    super(props);
    this.state = {currentRoomId: this.props.currentRoomId, currentUser: this.props.currentUser, participants: {}};
  }

  exitRoom(e) {
    var roomId = this.state.currentRoomId;
    var userId = this.state.currentUser;
    removeParticipant(userId, roomId, (data) => {
      console.log("removing participant", userId);
      browserHistory.push('/');
    });
  }


  componentWillMount() {

      getRoomParticipants(this.state.currentRoomId, (roomParticipants) => {
          this.setState({currentRoomId: this.state.currentRoomId, currentUser: this.state.currentUser, participants: roomParticipants.participants})
      });


  }

  componentWillReceiveProps(nextProps) {
      getUserInfo(nextProps.hostId, (user) => {
          this.setState({hostFullName: user.firstname + " " + user.lastname});
      });
  }


  render() {
    var roomParticipantsNames = this.state.participants;
    var roomParticipantsRows = [];
    for (var participant in roomParticipantsNames) {
        if(roomParticipantsNames[participant] === this.state.hostFullName) {
            roomParticipantsRows.push(
              <tr key={participant}>
                <td>{roomParticipantsNames[participant]} (Host) </td>
              </tr>
            );
        } else {
          roomParticipantsRows.push(
            <tr key={participant}>
              <td>{roomParticipantsNames[participant]}</td>
            </tr>
          );
      }
    }

    return (
      <div>
          <table className="table room-list">
          <tbody>
            <tr>
              <th><h2 className = 'tbHeader'>Participants</h2></th>
            </tr>

            {roomParticipantsRows}

          </tbody>
          </table>

          <button type = "button" className="btn btn-default" id="exit-room" onClick={(e)=>this.exitRoom(e)}>Exit Room</button>
      </div>

    );
  }

}
