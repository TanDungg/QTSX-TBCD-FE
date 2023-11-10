import React, { useState, useEffect } from "react";
import { Card, Form, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";

import { Input, TreeSelect, FormSubmit, Select } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import { convertObjectToUrlParams, getLocalStorage } from "src/util/Common";

const FormItem = Form.Item;

const initialState = {
  maCauTrucKho: "",
  tenCauTrucKho: "",
};

function KeForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading } = useSelector(({ common }) => common).toJS();
  const INFO = getLocalStorage("menu");
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);

  const [listCauTrucKho, setListCauTrucKho] = useState([]);
  const [listPhongBan, setListPhongBan] = useState([]);
  const [fieldTouch, setFieldTouch] = useState(false);

  const { setFieldsValue, validateFields, resetFields } = form;
  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("new");
      }
    } else {
      if (permission && !permission.edit) {
        history.push("/home");
      } else {
        if (match.params.id) {
          setType("edit");
          setId(match.params.id);
          getInfo(match.params.id);
        }
      }
    }
    if (permission && (permission.add || permission.edit)) {
      // Lấy danh sách CauTrucKho
      getPhongBan();
    }

    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Lấy thông tin info
   *
   * @param {*} id
   */
  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/${id}`,
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
        const newData = res.data;
        setFieldsValue({
          CauTrucKho: {
            ...newData,
            sucChua: newData.sucChua.toString(),
          },
        });
        getListCauTrucKho(newData.phongBan_Id);
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy danh sách CauTrucKho
   *
   */
  const getPhongBan = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Phongban/phong-ban-tree?donviid=${INFO.donVi_Id}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListPhongBan(res.data);
        } else {
          setListPhongBan([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy danh sách CauTrucKho
   *
   */
  const getListCauTrucKho = async (phongBan_Id) => {
    const params = convertObjectToUrlParams({
      phongBan_Id: phongBan_Id,
      thuTu: 1,
      isThanhPham: true,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `CauTrucKho/cau-truc-kho-by-phong-ban?${params}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListCauTrucKho(res.data);
        } else {
          setListCauTrucKho([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const { maCauTrucKho, tenCauTrucKho } = initialState;
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.CauTrucKho);
  };
  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.CauTrucKho, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (CauTrucKho, saveQuit = false) => {
    if (type === "new") {
      const newUser = CauTrucKho;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `CauTrucKho/ke-thanh-pham`,
            "POST",
            newUser,
            "ADD",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (saveQuit) {
            goBack();
          } else {
            resetFields();
            setFieldTouch(false);
            getListCauTrucKho();
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const editUser = { id, ...CauTrucKho };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `CauTrucKho/ke-thanh-pham/${id}`,
            "PUT",
            editUser,
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (saveQuit) {
            goBack();
          } else {
            setFieldTouch(false);
            getInfo(id);
          }
        })
        .catch((error) => console.log(error));
    }
  };
  const handleSelectPhongBan = (val) => {
    getListCauTrucKho(val);
    setFieldsValue({
      CauTrucKho: {
        cauTrucKho_Id: null,
      },
    });
  };

  /**
   * Quay lại trang cấu trúc kho
   *
   */
  const goBack = () => {
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${match.params.id}/chinh-sua`,
        ""
      )}`
    );
  };

  const formTitle = type === "new" ? "Thêm mới kệ" : "Chỉnh sửa kệ";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card className="th-card-margin-bottom">
        <Spin spinning={loading}>
          <Form
            {...DEFAULT_FORM_CUSTOM}
            form={form}
            name="nguoi-dung-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <FormItem
              label="Mã kệ"
              name={["CauTrucKho", "maCauTrucKho"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={maCauTrucKho}
            >
              <Input className="input-item" placeholder="Nhập mã kệ" />
            </FormItem>
            <FormItem
              label="Tên kệ"
              name={["CauTrucKho", "tenCauTrucKho"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={tenCauTrucKho}
            >
              <Input className="input-item" placeholder="Nhập tên kệ" />
            </FormItem>
            <FormItem
              label="Sức chứa"
              name={["CauTrucKho", "sucChua"]}
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
              <Input className="input-item" placeholder="Nhập sức chứa" />
            </FormItem>
            <FormItem
              label="Xưởng"
              name={["CauTrucKho", "phongBan_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <TreeSelect
                className="tree-select-item"
                datatreeselect={listPhongBan}
                name="PhongBan"
                options={["id", "tenPhongBan", "children"]}
                placeholder="Chọn xưởng"
                style={{ width: "100%" }}
                onSelect={handleSelectPhongBan}
              />
            </FormItem>
            <FormItem
              label="Kho"
              name={["CauTrucKho", "cauTrucKho_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={listCauTrucKho}
                placeholder="Chọn kho"
                optionsvalue={["id", "tenCTKho"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
                disabled={type === "new" || type === "edit" ? false : true}
              />
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

export default KeForm;