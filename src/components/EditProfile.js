import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap'; // Assuming you're using React Bootstrap

const EditProfile = ({ show, setShow, onSubmit }) => {
    const [nickname, setNickname] = useState('');

    const handleClose = () => setShow(false);

    const handleSubmit = () => {
        console.log("Nickname submitted:", nickname);
        onSubmit(nickname); // Pass the nickname to the parent
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Nickname</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formNickname">
                        <Form.Label>Enter your new nickname</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditProfile;
