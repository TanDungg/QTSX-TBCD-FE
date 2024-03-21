import { Modal as AntModal, Card, Button, Row, Col, Form, Input } from "antd";
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

function ModalChonUser({ openModalFS, openModal, itemData, DataChonUser }) {
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
  const [ListCBNV, setListCBNV] = useState([]);
  const [ListUser, setListUser] = useState([]);
  const [DataUser, setDataUser] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListUSer();
      setDataUser(itemData.length !== 0 ? itemData : []);
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListUSer = () => {
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
        const newData = res.data.filter((data) => {
          if (itemData.length === 0) {
            return data;
          } else {
            return !itemData.some(
              (item) =>
                item.user_Id.toLowerCase() === data.user_Id.toLowerCase()
            );
          }
        });

        setListUser(newData);
        setListCBNV(res.data);
      } else {
        setListUser([]);
        setListCBNV([]);
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
    ModalDeleteConfirm(deleteItemAction, item, item.fullName, "");
  };

  const deleteItemAction = (item) => {
    const newData = DataUser.filter(
      (data) => data.user_Id.toLowerCase() !== item.user_Id.toLowerCase()
    );
    setDataUser(newData);

    const newListCBNV = ListCBNV.filter(
      (data) => data.user_Id.toLowerCase() === item.user_Id.toLowerCase()
    );
    setListUser([...ListUser, ...newListCBNV]);
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
      title: "Mã nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      align: "center",
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "center",
    },
    {
      title: "SL con dấu",
      dataIndex: "soLuongConDau",
      key: "soLuongConDau",
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
    const data_user = value.chon_user;
    const newData = ListUser.find(
      (data) => data.user_Id.toLowerCase() === data_user.user_Id.toLowerCase()
    );
    const user = {
      ...data_user,
      maNhanVien: newData && newData.maNhanVien,
      fullName: newData && newData.fullName,
    };
    setDataUser([...DataUser, user]);

    const newListCBNV = ListUser.filter(
      (data) => data.user_Id.toLowerCase() !== data_user.user_Id.toLowerCase()
    );
    setListUser(newListCBNV);
    setFieldTouch(false);
    resetFields();
  };

  const XacNhan = () => {
    DataChonUser(DataUser);
    openModalFS(false);
    resetFields();
    setDataUser([]);
    setListUser([]);
  };

  const handleCancel = () => {
    setDataUser([]);
    setListUser([]);
    resetFields();
    openModalFS(false);
  };

  return (
    <AntModal
      title={`Chọn người sử dụng con dấu`}
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
                  name={["chon_user", "user_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListUser}
                    placeholder="Chọn sử dụng con dấu"
                    optionsvalue={["id", "fullName"]}
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
                  label="SL con dấu"
                  name={["chon_user", "soLuongConDau"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập số lượng con dấu"
                  />
                </FormItem>
              </Col>
            </Row>
            <Row
              justify={"center"}
              style={{
                marginTop: 10,
                marginBotom: 10,
              }}
            >
              <Button
                className="th-margin-bottom-0"
                type="primary"
                htmlType={"submit"}
                disabled={!fieldTouch}
              >
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
            dataSource={reDataForTable(DataUser)}
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
              disabled={DataUser.length === 0}
            >
              Xác nhận
            </Button>
          </div>
        </Card>
      </div>
    </AntModal>
  );
}

export default ModalChonUser;
