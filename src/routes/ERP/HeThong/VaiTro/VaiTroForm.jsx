import React, { useState, useEffect } from "react";
import { Form, Card, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import includes from "lodash/includes";

import { Input, FormSubmit, Select, TreeSelect } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";

const FormItem = Form.Item;

const initState = {
  name: "",
  description: "",
  phanMem_Id: "",
};

function VaiTroForm({ history, match, permission }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [id, setId] = useState(undefined);
  const [type, setType] = useState("new");
  const [fieldTouch, setFieldTouch] = useState(false);
  const [PhanMemSelect, setPhanMemSelect] = useState([]);
  const [DonViSelect, setDonViSelect] = useState([]);
  const [form] = Form.useForm();
  const { setFieldsValue, resetFields, validateFields } = form;
  const { name, description, phanMem_Id } = initState;
  const [expandedKeys, setExpandedKeys] = useState([]);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && !permission.add) {
          history.push("/home");
        } else {
          setType("new");
          getPhanMem();
          getDonVi();
        }
      } else {
        if (permission && !permission.edit) {
          history.push("/home");
        } else {
          if (match.params.id) {
            setType("edit");
            setId(match.params.id);
            getInfo(match.params.id);
            getPhanMem();
            getDonVi();
          }
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Lấy thông tin vai trò
   *
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`Role/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res.data) {
          setType("edit");
          res.data.nameId =
            res.data.tapDoan_Id +
            (res.data.donVi_Id ? "_" + res.data.donVi_Id : "") +
            (res.data.phongBan_Id ? "_" + res.data.phongBan_Id : "");
          if (res.data.donVi_Id) {
            setExpandedKeys([res.data.tapDoan_Id]);
          } else if (res.data.phongBan_Id) {
            setExpandedKeys([res.data.tapDoan_Id, res.data.donVi_Id]);
          }
          setFieldsValue({
            vaiTro: res.data,
          });
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy list phần mềm
   *
   * @param {*}
   */
  const getPhanMem = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `PhanMem?page=-1`,
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
          setPhanMemSelect(res.data);
        } else {
          setPhanMemSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy list đơn vị
   *
   * @param {*}
   */
  const getDonVi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Menu/dropdown-td-dv-pb`,
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
          setDonViSelect(res.data);
        } else {
          setDonViSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.vaiTro);
  };

  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.vaiTro, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  /**
   * Lưu dữ liệu
   *
   * @param {*} vaiTro
   * @param {boolean} [saveQuit=false]
   */
  const saveData = (vaiTro, saveQuit = false) => {
    const exp = vaiTro.nameId.split("_");
    if (exp.length === 1) {
      vaiTro.tapDoan_Id = exp[0];
    } else if (exp.length === 2) {
      vaiTro.tapDoan_Id = exp[0];
      vaiTro.donVi_Id = exp[1];
    } else if (exp.length === 3) {
      vaiTro.tapDoan_Id = exp[0];
      vaiTro.donVi_Id = exp[1];
      vaiTro.phongBan_Id = exp[2];
    }
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`Role`, "POST", vaiTro, "ADD", "", resolve, reject)
        );
      })
        .then((res) => {
          if (saveQuit) {
            if (res.status !== 409) goBack();
          } else {
            resetFields();
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = vaiTro;
      newData.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`Role/${id}`, "PUT", newData, "EDIT", "", resolve, reject)
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

  /**
   * Quay lại danh sách vai trò
   *
   */
  const goBack = () => {
    history.push("/he-thong-erp/vai-tro");
  };

  const formTitle = type === "new" ? "Thêm mới vai trò" : "Chỉnh sửa vai trò";
  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Spin spinning={loading}>
          <Form
            {...DEFAULT_FORM_CUSTOM}
            form={form}
            name="vai-tro-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <FormItem
              label="Phần mềm"
              name={["vaiTro", "phanMem_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={phanMem_Id}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={PhanMemSelect ? PhanMemSelect : []}
                placeholder="Chọn phần mềm"
                optionsvalue={["id", "tenPhanMem"]}
                style={{ width: "100%" }}
                optionFilterProp={"name"}
                showSearch
              />
            </FormItem>
            <FormItem
              label="Đơn vị"
              name={["vaiTro", "nameId"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
            >
              <TreeSelect
                className="tree-select-item"
                placeholder="Chọn đơn vị"
                datatreeselect={DonViSelect}
                name="menu"
                options={["nameId", "name", "children"]}
                style={{ width: "100%" }}
                treeExpandedKeys={expandedKeys}
                onTreeExpand={(expandedKeys) => setExpandedKeys(expandedKeys)}
              />
            </FormItem>
            <FormItem
              label="Mã quyền"
              name={["vaiTro", "name"]}
              rules={[
                {
                  type: "string",
                  required: true,
                  max: 255,
                },
              ]}
              initialValue={name}
            >
              <Input className="input-item" placeholder="Nhập Mã quyền" />
            </FormItem>
            <FormItem
              label="Tên quyền"
              name={["vaiTro", "description"]}
              rules={[
                {
                  type: "string",
                  required: true,
                  max: 255,
                },
              ]}
              initialValue={description}
            >
              <Input className="input-item" placeholder="Nhập Tên quyền" />
            </FormItem>
            <FormSubmit
              goBack={goBack}
              saveAndClose={saveAndClose}
              disabled={fieldTouch}
            />
          </Form>
        </Spin>
      </Card>
    </div>
  );
}

export default VaiTroForm;
