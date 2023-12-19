import { Modal as AntModal, Form, Row, Button, Card, Col, Switch } from "antd";
import { map } from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { Table, EditableTableRow } from "src/components/Common";
import { DEFAULT_FORM_CONGDOAN } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getDateNow,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";

const FormItem = Form.Item;
const { EditableRow, EditableCell } = EditableTableRow;

function ModalKiemSoatChatLuong({ openModalFS, openModal }) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields } = form;
  const [ListCongDoan, setListCongDoan] = useState([]);
  const [ListXuong, setListXuong] = useState([]);

  useEffect(() => {
    if (openModal) {
      //   getListCongDoan();
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  //   const getListCongDoan = () => {
  //     const param = convertObjectToUrlParams({
  //       donVi_Id: INFO.donVi_Id,
  //     });
  //     new Promise((resolve, reject) => {
  //       dispatch(
  //         fetchStart(
  //           `tits_qtsx_CongDoan?${param}&page=-1`,
  //           "GET",
  //           null,
  //           "DETAIL",
  //           "",
  //           resolve,
  //           reject
  //         )
  //       );
  //     }).then((res) => {
  //       if (res && res.data) {
  //         setListCongDoan(res.data);
  //       } else {
  //         setListCongDoan([]);
  //       }
  //     });
  //   };

  //   const getListXuong = (congDoan_Id) => {
  //     const param = convertObjectToUrlParams({
  //       congDoan_Id,
  //     });
  //     new Promise((resolve, reject) => {
  //       dispatch(
  //         fetchStart(
  //           `tits_qtsx_Xuong?${param}&page=-1`,
  //           "GET",
  //           null,
  //           "DETAIL",
  //           "",
  //           resolve,
  //           reject
  //         )
  //       );
  //     }).then((res) => {
  //       if (res && res.data) {
  //         setListXuong(res.data);
  //       } else {
  //         setListXuong([]);
  //       }
  //     });
  //   };

  //   const onFinish = (values) => {
  //     const data = values.themcongdoan;
  //     const congdoan = ListCongDoan.filter(
  //       (d) => d.id === data.tits_qtsx_CongDoan_Id
  //     );
  //     const xuong = ListXuong.filter((d) => d.id === data.tits_qtsx_Xuong_Id);
  //     const newData = {
  //       ...data,
  //       tenCongDoan: congdoan[0].tenCongDoan,
  //       maCongDoan: congdoan[0].maCongDoan,
  //       tenXuong: xuong[0].tenXuong,
  //       maXuong: xuong[0].maXuong,
  //       list_Trams: [],
  //     };
  //     DataThemCongDoan(newData);
  //     resetFields();
  //     openModalFS(false);
  //   };

  //   const handleOnSelectCongDoan = (value) => {
  //     getListXuong(value);
  //   };
  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Số Serial",
      dataIndex: "soSerial",
      key: "soSerial",
      align: "center",
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center",
    },
  ];

  const columns = map(renderHead, (col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        info: col.info,
      }),
    };
  });

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const handleCancel = () => {
    openModalFS(false);
  };

  return (
    <AntModal
      title="Hồ sơ kiểm tra chất lượng"
      open={openModal}
      width={`95%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Row justify={"center"} style={{ marginBottom: 10 }}>
        <Col span={1}></Col>
        <Col span={13} style={{ marginBottom: 10 }}>
          Trạm:{" "}
          <span style={{ fontWeight: "bold" }}>
            Xưởng Lắp ráp - Chuyền Final - Final 4
          </span>
        </Col>
        <Col span={10} style={{ marginBottom: 10 }}>
          Thời gian vào trạm:{" "}
          <span style={{ fontWeight: "bold" }}>
            Thứ Hai, 18/12/2023, 18:10:16
          </span>
        </Col>
        <Col span={1}></Col>
        <Col span={13}>
          Sản phẩm: <span style={{ fontWeight: "bold" }}>SMRM_40GN</span>
        </Col>
        <Col span={10}>
          Số khung nội bộ:{" "}
          <span style={{ fontWeight: "bold" }}>VNSMRM00112222</span>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <Table
            bordered
            scroll={{ x: 800, y: "70vh" }}
            columns={columns}
            components={components}
            className="gx-table-responsive"
            dataSource={[]}
            size="small"
            pagination={false}
          />
        </Col>
        <Col span={12}></Col>

        <Col span={12}>
          <Table
            bordered
            scroll={{ x: 800, y: "70vh" }}
            columns={columns}
            components={components}
            className="gx-table-responsive"
            dataSource={[]}
            size="small"
            pagination={false}
          />
        </Col>
      </Row>
    </AntModal>
  );
}

export default ModalKiemSoatChatLuong;
