import { Button, Card, Form, Input, Modal as AntModal } from "antd";
import includes from "lodash/includes";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  FormSubmit,
  Select,
  Table,
  EditableTableRow,
} from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ModalChonUser from "./ModalChonUser";
import {
  EditOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { reDataForTable } from "src/util/Common";

const { EditableRow, EditableCell } = EditableTableRow;
const FormItem = Form.Item;

const ConDauForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [type, setType] = useState("new");
  const [ListUser, setListUser] = useState([]);
  const [ActiveModalChiTiet, setActiveModalChiTiet] = useState(false);
  const [ActiveModalChonUser, setActiveModalChonUser] = useState(false);
  const [id, setId] = useState(undefined);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          setType("new");
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else {
        if (permission && permission.edit) {
          setType("edit");
          const { id } = match.params;
          setId(id);
          getInfo(id);
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ConDau/${id}`,
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
          const list_user =
            res.data.tits_qtsx_ConDauChiTiets &&
            JSON.parse(res.data.tits_qtsx_ConDauChiTiets);
          setListUser(list_user);
          setFieldsValue({
            formcondau: res.data,
          });
        }
      })
      .catch((error) => console.error(error));
  };

  let colValuesUser = [
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
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${match.params.id}/chinh-sua`,
        ""
      )}`
    );
  };

  const onFinish = (values) => {
    saveData(values.formcondau);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.formcondau, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (formcondau, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...formcondau,
        tits_qtsx_ConDauChiTiets: ListUser,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_ConDau`,
            "POST",
            newData,
            "ADD",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
              setListUser([]);
            }
          } else {
            if (saveQuit) {
              goBack();
            } else {
              setFieldTouch(false);
            }
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...formcondau,
        id: id,
        tits_qtsx_ConDauChiTiets: ListUser,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_ConDau/${id}`,
            "PUT",
            newData,
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (saveQuit) {
            if (res.status !== 409) goBack();
          } else {
            getInfo(id);
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const handleChonUser = (data) => {
    setListUser(data);
    setFieldTouch(true);
  };

  const formTitle = type === "new" ? "Thêm mới con dấu" : "Chỉnh sửa con dấu";
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_CUSTOM}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <FormItem
            label="Loại con dấu"
            name={["formcondau", "tenConDauDong1"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={[{ value: "QC PASS" }, { value: "QA PASS" }]}
              placeholder="Chọn loại con dấu"
              optionsvalue={["value", "value"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Tên con dấu"
            name={["formcondau", "tenConDauDong2"]}
            rules={[
              {
                type: "string",
              },
              {
                max: 250,
                message: "Tên con dấu không được quá 250 ký tự",
              },
            ]}
          >
            <Input className="input-item" placeholder="Nhập tên con dấu" />
          </FormItem>
          <FormItem
            label="Mã màu"
            name={["formcondau", "maMau"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={[
                { key: "S62", value: "Màu đỏ (Mã màu S62)" },
                { key: "S63", value: "Màu xanh dương (Mã màu S63)" },
              ]}
              placeholder="Chọn mã màu"
              optionsvalue={["key", "value"]}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="name"
            />
          </FormItem>
          <FormItem
            label="Xưởng/Chuyền"
            name={["formcondau", "tenPhongXuongChuyen"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Input className="input-item" placeholder="Nhập tên xưởng/chuyền" />
          </FormItem>
          <FormItem label="List người sử dụng">
            {ListUser && ListUser.length !== 0 && (
              <Button
                icon={<SearchOutlined />}
                className="th-margin-bottom-0"
                type="primary"
                onClick={() => setActiveModalChiTiet(true)}
              >
                Xem chi tiết
              </Button>
            )}
            {(type === "new" || type === "edit") && (
              <Button
                icon={
                  ListUser.length ? <EditOutlined /> : <PlusCircleOutlined />
                }
                className="th-margin-bottom-0"
                type="primary"
                onClick={() => setActiveModalChonUser(true)}
              >
                {ListUser && ListUser.length === 0
                  ? `Thêm người sử dụng`
                  : `Chỉnh sửa người sử dụng`}
              </Button>
            )}
          </FormItem>
          <FormSubmit
            goBack={goBack}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        </Form>
      </Card>
      <ModalChonUser
        openModal={ActiveModalChonUser}
        openModalFS={setActiveModalChonUser}
        itemData={ListUser}
        DataChonUser={handleChonUser}
      />
      <AntModal
        title={`Danh sách người sử dụng con dấu`}
        className="th-card-reset-margin"
        open={ActiveModalChiTiet}
        width={width > 1200 ? `60%` : "80%"}
        closable={true}
        onCancel={() => setActiveModalChiTiet(false)}
        footer={null}
      >
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Table
            bordered
            columns={colValuesUser}
            scroll={{ x: 700, y: "50vh" }}
            components={components}
            className="gx-table-responsive"
            dataSource={reDataForTable(ListUser)}
            size="small"
            rowClassName={"editable-row"}
            pagination={false}
          />
        </Card>
      </AntModal>
    </div>
  );
};

export default ConDauForm;
