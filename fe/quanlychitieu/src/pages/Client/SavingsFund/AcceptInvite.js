import React, { useState } from "react";
import axios from "axios";
import { Cookies } from "react-cookie";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";

const AcceptInvite = () => {
  const [code, setCode] = useState("");
  const cookies = new Cookies();
  const token = cookies.get("token");
  const [loadingSend, setLoadingSend] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSend(true);
    try {
      const response = await axios.post(
        "http://localhost:4000/api/accept-invite",
        { code },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      toast.success("Tham gia quỹ tiết kiệm thành công");
      setCode("");

      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error response:", error.response);
      toast.warning("Mã xác nhận không hợp lệ");
    } finally {
      setLoadingSend(false);
    }
  };

  return (
    <div className="">
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            value={code}
            className="form-control"
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <div className="mt-3">
            <Button
              variant="primary"
              type="submit"
              className="ms-2"
              disabled={loadingSend}
            >
              {loadingSend ? "Đang gửi..." : "Gửi mã xác nhận"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AcceptInvite;
