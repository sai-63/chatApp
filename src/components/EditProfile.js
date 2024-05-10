import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useForm } from "react-hook-form";

function EditProfile({ show, setShow }) {
  let { register, setValue, getValues } = useForm();
  let [err, setErr] = useState("");

  function updateProfile() {
    let updatedProfile = getValues();

    // Check if any of the required fields are empty
    if (!updatedProfile.username || !updatedProfile.email) {
      setErr("Please enter the details  😡");
      return; // Exit the function early if any field is empty
    }

    axios
      .post(
        "http://localhost:5290/Chat/ProfileUpdate",{userId: updatedProfile.userid,
        email: updatedProfile.email,
        username: updatedProfile.username}
      )
      .then((res) => {
        if (res.data.success === true) {
          setErr("");
          setShow(false);
          alert(res.data.message);
        } else setErr(res.data.message);
      })
      .catch((err) => setErr(err.message));
  }
  useEffect(() => {
    // Reset error message when modal is closed
    if (!show) {
      setErr("");
    }
  }, [show]);

  // useEffect(() => {
  //   let host = localStorage.getItem("user");

  //   axios
  //     .get("http://localhost:4000/users")
  //     .then(async (res) => {
  //       let user = await res.data.users.filter((obj) => obj.userid === host);
  //       user = user[0];

  //       setValue("username", user.username);
  //       setValue("userid", user.userid);
  //       setValue("email", user.email);
  //       // setValue("mobile", user.mobile);
  //     })
  //     .catch((err) => console.log(err));
  // }, []);

  return (
    <div>
      <Modal
        show={show}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered     
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Edit Your Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {err.length !== 0 && <p>{err}</p>}
          <form>
            <input
              className="rounded mt-2 ms-2"
              type="text"
              placeholder="UserID"
              {...register("userid", { required: true })}
            />
            <input
              className="rounded mt-2 ms-2"
              type="text"
              placeholder="UserName"
              {...register("username", { required: true })}
            />
            <input
              className="rounded mt-2 ms-2"
              type="email"
              placeholder="Email"
              {...register("email", { required: true })}
            />
            {/* <input
              className="rounded mt-2 ms-2"
              type="number"
              placeholder="Mobile Number"
              {...register("mobile", { required: true })}
            /> */}
            <label className="ms-2"> Profile Picture </label>
            <input
              className="rounded mt-2 ms-2"
              type="file"
              {...register("picture")}
            />
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={updateProfile}>
            Save Changes
          </Button>
          <Button onClick={() => setShow(!show)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default EditProfile;
