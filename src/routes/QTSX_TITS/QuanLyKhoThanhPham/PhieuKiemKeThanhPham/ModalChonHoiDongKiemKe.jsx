import { Modal as AntModal, Card, Button, Row, Col, Form } from "antd";
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
import { DEFAULT_FORM_THEMVATTU } from "src/constants/Config";
import { DeleteOutlined } from "@ant-design/icons";

const FormItem = Form.Item;
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
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields } = form;
  const [ListHDKK, setListHDKK] = useState([]);
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
      donviId: INFO.donVi_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-cbnv?${params}&key=1`,
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
        const newData = res.data.filter((data) => {
          if (itemData.length === 0) {
            return data;
          } else {
            return !itemData.some((item) => item.id === data.user_Id);
          }
        });

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
    ModalDeleteConfirm(
      deleteItemAction,
      item,
      item.tenNguoiKiemKe,
      "hội đồng kiểm kê"
    );
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
      title: "Chức vụ",
      dataIndex: "tenChucVu",
      key: "tenChucVu",
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

  const onFinish = (value) => {
    const newData = ListHoiDongKiemKe.filter(
      (data) => data.id === value.chonhoidongkiemke.id
    );
    const HDKK = {
      id: newData && newData[0].user_Id,
      tenNguoiKiemKe: newData && newData[0].fullName,
      tenChucVu: newData && newData[0].tenChucVu,
    };
    setDataHoiDongKiemKe([...DataHoiDongKiemKe, HDKK]);

    const newListHDKK = ListHoiDongKiemKe.filter(
      (data) => data.user_Id !== value.chonhoidongkiemke.id
    );
    setListHoiDongKiemKe(newListHDKK);
    setFieldTouch(false);
    resetFields();
  };

  const XacNhan = () => {
    DataChonHDKK(DataHoiDongKiemKe);
    openModalFS(false);
    resetFields();
    setDataHoiDongKiemKe([]);
    setListHoiDongKiemKe([]);
  };

  const handleCancel = () => {
    setDataHoiDongKiemKe([]);
    setListHoiDongKiemKe([]);
    resetFields();
    openModalFS(false);
  };

  return (
    <AntModal
      title={`Chọn vật tư điều chuyển`}
      open={openModal}
      width={width > 1000 ? `60%` : "80%"}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom">
          <Form
            {...DEFAULT_FORM_THEMVATTU}
            form={form}
            name="nguoi-dung-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <Row>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Ông/bà"
                  name={["chonhoidongkiemke", "id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListHoiDongKiemKe}
                    placeholder="Chọn hội đồng kiểm kê"
                    optionsvalue={["user_Id", "fullName"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Chức vụ"
                  name={["chonhoidongkiemke", "id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListHoiDongKiemKe}
                    placeholder="Chức vụ"
                    optionsvalue={["user_Id", "tenChucVu"]}
                    style={{ width: "100%" }}
                    disabled={true}
                  />
                </FormItem>
              </Col>
            </Row>
            <Row
              justify={"center"}
              style={{
                marginTop: 10,
              }}
            >
              <Button type="primary" htmlType={"submit"} disabled={!fieldTouch}>
                Thêm
              </Button>
            </Row>
          </Form>
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
              className="th-btn-margin-bottom-0"
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