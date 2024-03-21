import { Modal as AntModal, Card, Button, Col } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Select,
  Table,
} from "src/components/Common";
import { DeleteOutlined } from "@ant-design/icons";
import Helpers from "src/helpers";

const { EditableRow, EditableCell } = EditableTableRow;

function ModalChonHoiDongKiemKe({
  openModalFS,
  openModal,
  itemData,
  DataChonHDKK,
}) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [ListHDKK, setListHDKK] = useState([]);
  const [HDKK, setHDKK] = useState(null);
  const [ListHoiDongKiemKe, setListHoiDongKiemKe] = useState([]);
  const [DataHoiDongKiemKe, setDataHoiDongKiemKe] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListHoiDongKiemTra();
      setDataHoiDongKiemKe(itemData.length !== 0 ? itemData : []);
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListHoiDongKiemTra = () => {
    const params = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/list-cbnv-thuoc-don-vi-va-co-quyen?${params}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        const newData = res.data
          .map((data) => {
            if (itemData.length === 0) {
              return {
                ...data,
                nhanVien: `${data.maNhanVien} - ${data.fullName}`,
              };
            } else {
              return !itemData.some((item) => item.id === data.user_Id)
                ? {
                    ...data,
                    nhanVien: `${data.maNhanVien} - ${data.fullName}`,
                  }
                : null;
            }
          })
          .filter(Boolean);

        setListHoiDongKiemKe(newData);
        setListHDKK(res.data);
      } else {
        setListHoiDongKiemKe([]);
        setListHDKK([]);
      }
    });
  };

  const actionContent = (item) => {
    const deleteVal = { onClick: () => deleteItemFunc(item) };
    return (
      <div>
        <a {...deleteVal} title="Xóa">
          <DeleteOutlined />
        </a>
      </div>
    );
  };

  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(deleteItemAction, item, item.tenNguoiKiemKe, "ông/bà");
  };

  const deleteItemAction = (item) => {
    const newData = DataHoiDongKiemKe.filter((data) => data.id !== item.id);
    setDataHoiDongKiemKe(newData);

    const newListHDKK = ListHDKK.filter((data) => data.user_Id === item.id);
    setListHoiDongKiemKe([...ListHoiDongKiemKe, ...newListHDKK]);
  };

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Họ và tên",
      dataIndex: "tenNguoiKiemKe",
      key: "tenNguoiKiemKe",
      align: "center",
    },
    {
      title: "Chức danh",
      dataIndex: "tenChucDanh",
      key: "tenChucDanh",
      align: "center",
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 100,
      render: (value) => actionContent(value),
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const handleSelectHDKK = (value) => {
    const hoidongkiemke =
      DataHoiDongKiemKe.length &&
      DataHoiDongKiemKe.filter((hdkk) => hdkk.id === value);

    if (hoidongkiemke.length) {
      Helpers.alertError(
        `Ông/Bà ${hoidongkiemke[0].tenNguoiKiemKe} đã được thêm vào`
      );
    } else {
      setHDKK(value);
      const newData = ListHoiDongKiemKe.filter(
        (data) => data.user_Id === value
      );

      const HDKK = newData && {
        id: newData[0].user_Id,
        tenNguoiKiemKe: newData[0].fullName,
        tenChucDanh: newData[0].tenChucDanh,
      };
      setDataHoiDongKiemKe([...DataHoiDongKiemKe, HDKK]);
    }

    // const newListHDKK = ListHoiDongKiemKe.filter(
    //   (data) => data.user_Id !== value
    // );
    // setListHoiDongKiemKe(newListHDKK);
  };

  const XacNhan = () => {
    DataChonHDKK(DataHoiDongKiemKe);
    setDataHoiDongKiemKe([]);
    setListHoiDongKiemKe([]);
    setHDKK(null);
    openModalFS(false);
  };

  const handleCancel = () => {
    setDataHoiDongKiemKe([]);
    setListHoiDongKiemKe([]);
    setHDKK(null);
    openModalFS(false);
  };

  return (
    <AntModal
      title={`Chọn hội đồng kiểm kê`}
      open={openModal}
      width={width > 1000 ? `60%` : "80%"}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            <Col
              xxl={12}
              xl={12}
              lg={16}
              md={16}
              sm={20}
              xs={24}
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  width: "80px",
                }}
              >
                Ông/bà:
              </span>
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListHoiDongKiemKe}
                placeholder="Chọn hội đồng kiểm kê"
                optionsvalue={["id", "nhanVien"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
                onSelect={handleSelectHDKK}
                value={HDKK}
              />
            </Col>
          </div>
          <Table
            bordered
            columns={colValues}
            scroll={{ x: 700, y: "40vh" }}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(DataHoiDongKiemKe)}
            size="small"
            rowClassName={"editable-row"}
            pagination={false}
          />
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 10 }}
          >
            <Button
              className="th-margin-bottom-0"
              type="primary"
              onClick={XacNhan}
              disabled={DataHoiDongKiemKe.length === 0}
            >
              Xác nhận
            </Button>
          </div>
        </Card>
      </div>
    </AntModal>
  );
}

export default ModalChonHoiDongKiemKe;
