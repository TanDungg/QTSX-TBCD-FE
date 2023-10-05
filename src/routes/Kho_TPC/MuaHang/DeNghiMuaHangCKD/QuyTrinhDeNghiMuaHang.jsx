import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Card, Steps } from "antd";
import { includes, map } from "lodash";
import Helpers from "src/helpers";
import moment from "moment";
import React, { useEffect, useState, useRef, useContext } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  Select,
  Table,
  ModalDeleteConfirm,
  Modal,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";

const QuyTrinhDeNghiMuaHang = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [current, setCurrent] = useState(0);
  const [status, setStatus] = useState(false);

  const [info, setInfo] = useState({});
  useEffect(() => {
    const load = () => {
      if (includes(match.url, "quy-trinh")) {
        if (permission && permission.add) {
          const { id } = match.params;
          getInfo(id);
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /**
   * Lấy thông tin
   *
   */
  const getInfo = (id) => {
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_PhieuDeNghiMuaHang/${id}?${params}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setCurrent(
            res.data.isKiemTraXacNhan === null
              ? 0
              : res.data.isKeToanXacNhan === null
              ? 1
              : res.data.isXacNhan === null
              ? 2
              : 3
          );
          if (
            res.data.lyDoKiemTraTuChoi ||
            res.data.lyDoKeToanTuChoi ||
            res.data.lyDoDuyetTuChoi
          ) {
            setStatus(true);
          }
          setInfo(res.data);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Quay lại trang bộ phận
   *
   */
  const goBack = () => {
    history.push(`${match.url.replace(`/${match.params.id}/quy-trinh`, "")}`);
  };

  const formTitle = " Quy trình đề nghị mua hàng";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Steps
          current={current}
          direction="vertical"
          status={status ? "error" : ""}
          items={[
            {
              title: "Kiểm tra (Ký xác nhận)",
              description: info.tenNguoiKiemTra,
            },
            {
              title: "Kế toán (Ký xác nhận)",
              description: info.tenNguoiKeToan,
            },
            {
              title: "Duyệt (Ký xác nhận)",
              description: info.tenNguoiDuyet,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default QuyTrinhDeNghiMuaHang;
