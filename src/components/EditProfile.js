import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap'; // Assuming you're using React Bootstrap
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';

const EditProfile = ({showoverlay,tar, setShowOverlay, onSubmit }) => {
    const [nickname, setNickname] = useState('');
    const [editingname,setEditingName]=useState(false);

    const handleClose = () => setShowOverlay(false);

    const handleSubmit = () => {
        console.log("Nickname submitted:", nickname);
        setEditingName(false);
        onSubmit(nickname); // Pass the nickname to the parent
        handleClose();
    };
    const editName=()=>{
        setEditingName(true);
    }
    return (
        <Overlay show={showoverlay} target={tar} placement="right-start" containerPadding={10}>
            <Popover id="popover-contained">
                <Popover.Header as="h3"><center><h5>{localStorage.getItem('username')}</h5></center></Popover.Header>
                <Popover.Body>
                    {editingname ? 
                    (<input type='text' value={nickname} placeholder='New NickName' onChange={(e)=>setNickname(e.target.value)} />):
                    (<Button onClick={editName} style={{fontSize:'12px',width:'100%',}}>New Name</Button>)
                    }
                    <div style={{display:'flex',justifyContent:'space-around',marginTop:'10px'}}>
                        <div style={{ padding: '5px 10px', fontSize: '12px', minWidth: '50px' }}><Button onClick={handleSubmit}><i class="bi bi-check-circle-fill"></i></Button></div>
                        <div style={{ padding: '5px 10px', fontSize: '12px', minWidth: '40px' }}><Button onClick={handleClose}><i class="bi bi-x-circle-fill"></i></Button></div>
                    </div>
                </Popover.Body>
            </Popover>
        </Overlay>
    );
};

export default EditProfile;
