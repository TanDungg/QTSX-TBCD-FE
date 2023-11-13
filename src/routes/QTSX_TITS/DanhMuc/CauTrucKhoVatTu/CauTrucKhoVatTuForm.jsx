import React, { useState, useEffect } from "react";
import { Card, Form, Spin, Switch } from "antd";
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
  tits_qtsx_CauTrucKho: "root",
  isActive: false,
};

function CauTrucKhoVatTuForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading, item } = useSelector(({ common }) => common).toJS();
  const INFO = getLocalStorage("menu");
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [listCauTrucKho, setListCauTrucKho] = useState([]);
  const [disableViTri, setDisableViTri] = useState(true);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListChungTu, setListChungTu] = useState([]);

  const { setFieldsValue, validateFields, resetFields, getFieldValue } = form;
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
      getListCauTrucKho();
      getChungTu();
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
          `tits_qtsx_CauTrucKho/${id}`,
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
        if (newData.tits_qtsx_CauTrucKho_Id === null) {
          newData.tits_qtsx_CauTrucKho_Id = "root";
        } else {
          setDisableViTri(false);
        }
        setFieldsValue({
          CauTrucKho: {
            ...newData,
            viTri: newData.viTri,
            tits_qtsx_CauTrucKho_ChungTus:
              newData.chiTietChungTus &&
              JSON.parse(newData.chiTietChungTus).map((ct) =>
                ct.tits_qtsx_ChungTu_Id.toLowerCase()
              ),
          },
        });
      })
      .catch((error) => console.error(error));
  };
  const getChungTu = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ChungTu?page=-1`,
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
          setListChungTu(res.data);
        } else {
          setListChungTu([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy danh sách CauTrucKho
   *
   */
  const getListCauTrucKho = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_CauTrucKho/cau-truc-kho-vat-tu-tree`,
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
        setListCauTrucKho([]);
        const newList = { id: "root", tenCauTrucKho: "Root", children: [] };
        setListCauTrucKho([newList, ...res.data]);
      })
      .catch((error) => console.error(error));
  };

  const { maCauTrucKho, tenCauTrucKho, tits_qtsx_CauTrucKho, isActive } =
    initialState;
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
      CauTrucKho.viTri === undefined
        ? (CauTrucKho.viTri = 0)
        : (CauTrucKho.viTri = CauTrucKho.viTri);
      const newUser = CauTrucKho;
      newUser.tits_qtsx_CauTrucKho_Id =
        newUser.tits_qtsx_CauTrucKho_Id === "root"
          ? null
          : newUser.tits_qtsx_CauTrucKho_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_CauTrucKho/cau-truc-kho-vat-tu`,
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
          if (res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
              getListCauTrucKho();
            }
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const editUser = { id: id, ...item, ...CauTrucKho };
      editUser.tits_qtsx_CauTrucKho_Id =
        editUser.tits_qtsx_CauTrucKho_Id === "root"
          ? (editUser.tits_qtsx_CauTrucKho_Id = null)
          : editUser.tits_qtsx_CauTrucKho_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_CauTrucKho/${id}`,
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
          if (res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              setFieldTouch(false);
              getInfo(id);
            }
          }
        })
        .catch((error) => console.log(error));
    }
  };
  const handleSelectPhongBan = (val) => {
    getListCauTrucKho(val);
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

  const formTitle =
    type === "new" ? "Thêm mới kho vật tư" : "Chỉnh sửa kho vật tư";

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
              label="Mã kho vật tư"
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
              <Input className="input-item" placeholder="Nhập mã kho vật tư" />
            </FormItem>
            <FormItem
              label="Tên kho vật tư"
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
              <Input className="input-item" placeholder="Nhập tên kho vật tư" />
            </FormItem>
            {/* 
            <FormItem
              label="Cấu trúc kho cha"
              name={["CauTrucKho", "tits_qtsx_CauTrucKho_Id"]}
              rules={[
                {
                  type: "string",
                },
              ]}
              initialValue={tits_qtsx_CauTrucKho}
            >
              <TreeSelect
                className="tree-select-item"
                datatreeselect={listCauTrucKho}
                name="CauTrucKho"
                options={["id", "tenCauTrucKho", "children"]}
                placeholder="Chọn cấu trúc kho cha"
                style={{ width: "100%" }}
                onSelect={(val) => {
                  if (val !== "root") {
                    setDisableViTri(false);
                    setFieldsValue({
                      CauTrucKho: {
                        tits_qtsx_CauTrucKho_ChungTus: null,
                      },
                    });
                  } else {
                    setDisableViTri(true);
                    setFieldsValue({
                      CauTrucKho: {
                        viTri: null,
                      },
                    });
                  }
                }}
              />
            </FormItem> */}
            {/* <FormItem label="Vị trí" name={["CauTrucKho", "viTri"]}>
              <Input
                className="input-item"
                type="number"
                placeholder="Nhập vị trí"
                disabled={disableViTri}
              />
            </FormItem> */}
            <FormItem
              label="Chứng từ"
              name={["CauTrucKho", "tits_qtsx_CauTrucKho_ChungTus"]}
              rules={[
                {
                  type: "array",
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListChungTu ? ListChungTu : []}
                placeholder="Chọn chứng từ"
                optionsvalue={["id", "tenChungTu"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
                mode={"multiple"}
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

export default CauTrucKhoVatTuForm;
