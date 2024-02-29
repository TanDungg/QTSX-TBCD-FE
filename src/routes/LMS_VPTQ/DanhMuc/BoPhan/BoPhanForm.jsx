import { Card, Col, Form, Input } from "antd";
import includes from "lodash/includes";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, TreeSelect } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_ADD_130PX } from "src/constants/Config";
import { getLocalStorage, getTokenInfo } from "src/util/Common";

const FormItem = Form.Item;
const initialState = {
  boPhan_Id: "root",
};

const BoPhanForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const { boPhan_Id } = initialState;
  const [form] = Form.useForm();
  const { validateFields, resetFields, setFieldsValue } = form;
  const [type, setType] = useState("new");
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListPhongBan, setListPhongBan] = useState([]);
  const [ListBoPhan, setListBoPhan] = useState([]);
  const [id, setId] = useState(undefined);

  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          getListPhongBan();
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

  const getListPhongBan = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Phongban/phong-ban-tree?donviid=${INFO.donVi_Id}`,
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
        setListPhongBan(res.data);
      } else {
        setListPhongBan([]);
      }
    });
  };

  const getBoPhan = (phongBan_Id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `BoPhan/bo-phan-tree?donviid=${INFO.donVi_Id}&&phongBan_Id=${phongBan_Id}`,
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
        const newlist = { id: "root", tenBoPhan: "Root", children: [] };
        setListBoPhan([newlist, ...res.data]);
      } else {
        setListBoPhan([]);
      }
    });
  };

  const getInfo = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`BoPhan/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          const data = res.data;
          getListPhongBan();
          getBoPhan(data.phongBan_Id);
          setFieldsValue({
            bophan: {
              ...data,
              boPhan_Id: data.boPhan_Id ? data.boPhan_Id : "root",
            },
          });
        }
      })
      .catch((error) => console.error(error));
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
    saveData(values.bophan);
  };

  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.bophan, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (bophan, saveQuit = false) => {
    if (type === "new") {
      const newData = {
        ...bophan,
        boPhan_Id: bophan.boPhan_Id === "root" ? null : bophan.boPhan_Id,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`BoPhan`, "POST", newData, "ADD", "", resolve, reject)
        );
      })
        .then((res) => {
          if (res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
            }
          } else {
            setFieldTouch(false);
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      const newData = {
        ...bophan,
        id: id,
        boPhan_Id: bophan.boPhan_Id === "root" ? null : bophan.boPhan_Id,
      };

      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `BoPhan/${id}`,
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
          if (res.status === 409 || !saveQuit) {
            setFieldTouch(false);
          } else {
            goBack();
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const hanldeSelectPhongBan = (val) => {
    getBoPhan(val);
  };

  const formTitle = type === "new" ? "Thêm mới bộ phận" : "Chỉnh sửa bộ phận";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} back={goBack} />
      <Card
        className="th-card-margin-bottom"
        align="center"
        style={{ width: "100%" }}
      >
        <Form
          {...DEFAULT_FORM_ADD_130PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Mã bộ phận"
              name={["bophan", "maBoPhan"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 50,

                  message: "Mã bộ phận không được quá 50 ký tự",
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập mã bộ phận" />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Tên bộ phận"
              name={["bophan", "tenBoPhan"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                  message: "Tên bộ phận không được quá 250 ký tự",
                },
              ]}
            >
              <Input className="input-item" placeholder="Nhập tên bộ phận" />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Phòng ban"
              name={["bophan", "phongBan_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <TreeSelect
                className="tree-select-item"
                datatreeselect={ListPhongBan}
                name="PhongBan"
                options={["id", "tenPhongBan", "children"]}
                placeholder="Chọn Ban/Phòng"
                style={{ width: "100%" }}
                onSelect={hanldeSelectPhongBan}
              />
            </FormItem>
          </Col>
          <Col xxl={12} xl={14} lg={16} md={16} sm={20} xs={24}>
            <FormItem
              label="Bộ phận cha"
              name={["bophan", "boPhan_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
              initialValue={boPhan_Id}
            >
              <TreeSelect
                className="tree-select-item"
                datatreeselect={ListBoPhan}
                name="CauTrucKho"
                options={["id", "tenBoPhan", "children"]}
                placeholder="Chọn bộ phận cha"
                style={{ width: "100%" }}
              />
            </FormItem>
          </Col>
          <FormSubmit
            goBack={goBack}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        </Form>
      </Card>
    </div>
  );
};

export default BoPhanForm;
