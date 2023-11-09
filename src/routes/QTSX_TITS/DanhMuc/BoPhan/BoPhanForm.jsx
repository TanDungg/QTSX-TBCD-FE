import { Card, Form, Input } from "antd";
import includes from "lodash/includes";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { FormSubmit, TreeSelect } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import { getLocalStorage } from "src/util/Common";

const FormItem = Form.Item;

const initialState = {
  maBoPhan: "",
  tenBoPhan: "",
  boPhan_Id: "root",
};
const BoPhanForm = ({ history, match, permission }) => {
  const dispatch = useDispatch();
  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { maBoPhan, tenBoPhan, boPhan_Id } = initialState;
  const [phongBanSelect, setPhongBanSelect] = useState([]);
  const [BoPhanSelect, setBoPhanSelect] = useState([]);

  const INFO = getLocalStorage("menu");
  const { validateFields, resetFields, setFieldsValue } = form;
  const [info, setInfo] = useState({});
  useEffect(() => {
    const load = () => {
      if (includes(match.url, "them-moi")) {
        if (permission && permission.add) {
          getData();
          setType("new");
        } else if (permission && !permission.add) {
          history.push("/home");
        }
      } else {
        if (permission && permission.edit) {
          setType("edit");
          const { id } = match.params;
          setId(id);
          getInfo();
        } else if (permission && !permission.edit) {
          history.push("/home");
        }
      }
    };
    load();
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getData = () => {
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
        setPhongBanSelect(res.data);
      } else {
        setPhongBanSelect([]);
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
        setBoPhanSelect([newlist, ...res.data]);
      } else {
        setBoPhanSelect([]);
      }
    });
  };
  /**
   * Lấy thông tin
   *
   */
  const getInfo = () => {
    const { id } = match.params;
    getData();
    setId(id);
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`BoPhan/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          const data = res.data;
          if (data.boPhan_Id === null) data.boPhan_Id = "root";
          getBoPhan(data.phongBan_Id);
          setFieldsValue({
            bophan: data,
          });
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
    history.push(
      `${match.url.replace(
        type === "new" ? "/them-moi" : `/${match.params.id}/chinh-sua`,
        ""
      )}`
    );
  };

  /**
   * Khi submit
   *
   * @param {*} values
   */
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

  const saveData = (BoPhan, saveQuit = false) => {
    if (type === "new") {
      const newData = BoPhan;
      newData.boPhan_Id =
        newData.boPhan_Id === "root" ? null : newData.boPhan_Id;
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
      const editBoPhan = { ...info, ...BoPhan };
      editBoPhan.boPhan_Id =
        editBoPhan.boPhan_Id === "root"
          ? (editBoPhan.boPhan_Id = null)
          : editBoPhan.boPhan_Id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `BoPhan/${id}`,
            "PUT",
            editBoPhan,
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
            getInfo();
            setFieldTouch(false);
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
      <Card className="th-card-margin-bottom">
        <Form
          {...DEFAULT_FORM_CUSTOM}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
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
            initialValue={maBoPhan}
          >
            <Input className="input-item" placeholder="Nhập mã bộ phận" />
          </FormItem>
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
            initialValue={tenBoPhan}
          >
            <Input className="input-item" placeholder="Nhập tên bộ phận" />
          </FormItem>
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
              datatreeselect={phongBanSelect}
              name="PhongBan"
              options={["id", "tenPhongBan", "children"]}
              placeholder="Chọn Ban/Phòng"
              style={{ width: "100%" }}
              onSelect={hanldeSelectPhongBan}
            />
          </FormItem>
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
              datatreeselect={BoPhanSelect}
              name="CauTrucKho"
              options={["id", "tenBoPhan", "children"]}
              placeholder="Chọn bộ phận cha"
              style={{ width: "100%" }}
            />
          </FormItem>

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
