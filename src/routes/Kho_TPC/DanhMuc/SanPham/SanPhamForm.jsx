import React, { useState, useEffect } from "react";
import { Card, Form, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";

import { Input, Select, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import tree from "src/components/Common/Tree_Old";

const FormItem = Form.Item;

const initialState = {
  maSP: "",
  tenSP: "",
  loaiSanPham_Id: "",
};

function SanPhamForm({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading, item } = useSelector(({ common }) => common).toJS();

  const [type, setType] = useState("new");
  const [id, setId] = useState(undefined);
  const [listMenu, setListMenu] = useState([]);
  const [LoaiSanPhamSelect, setLoaiSanPhamSelect] = useState([]);
  const [MauSacSelect, setMauSacSelect] = useState([]);
  const [DonViTinhSelect, setDonViTinhSelect] = useState([]);

  const [fieldTouch, setFieldTouch] = useState(false);

  const { setFieldsValue, validateFields, resetFields } = form;
  useEffect(() => {
    if (includes(match.url, "them-moi")) {
      if (permission && !permission.add) {
        history.push("/home");
      } else {
        setType("new");
        getData();
      }
    } else {
      if (permission && !permission.edit) {
        history.push("/home");
      } else {
        if (match.params.id) {
          setType("edit");
          setId(match.params.id);
          getInfo(match.params.id);
          getData();
        }
      }
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
        fetchStart(`SanPham/${id}`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setFieldsValue({
            SanPham: {
              ...res.data,
              mauSac_Id:
                res.data.mauSac &&
                JSON.parse(res.data.mauSac).map((ms) =>
                  ms.mauSac_Id.toLowerCase()
                ),
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const getData = () => {
    getDonViTinh();
    getLoaiSanPham();
    getMauSac();
  };

  /**
   * Lấy danh sách menu
   *
   */
  const getLoaiSanPham = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "LoaiSanPham?page=-1",
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
          setLoaiSanPhamSelect(res.data);
        } else {
          setLoaiSanPhamSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy danh sách menu
   *
   */
  const getMauSac = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart("MauSac?page=-1", "GET", null, "LIST", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setMauSacSelect(res.data);
        } else {
          setMauSacSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * Lấy danh sách menu
   *
   */
  const getDonViTinh = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          "DonViTinh?page=-1",
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
          setDonViTinhSelect(res.data);
        } else {
          setDonViTinhSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const { maSP, tenSP, loaiSanPham_Id } = initialState;
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData(values.SanPham);
  };
  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.SanPham, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (SanPham, saveQuit = false) => {
    const newData = SanPham;
    newData.chiTietMauSacs = SanPham.mauSac_Id.map((ms) => {
      return { mauSac_Id: ms };
    });
    if (type === "new") {
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(`SanPham`, "POST", SanPham, "ADD", "", resolve, reject)
        );
      })
        .then((res) => {
          if (res && res.status !== 409) {
            if (saveQuit) {
              goBack();
            } else {
              resetFields();
              setFieldTouch(false);
            }
          }
        })
        .catch((error) => console.error(error));
    }
    if (type === "edit") {
      SanPham.id = id;
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `SanPham/${id}`,
            "PUT",
            SanPham,
            "EDIT",
            "",
            resolve,
            reject
          )
        );
      })
        .then((res) => {
          if (res && res.status !== 409) {
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

  /**
   * Quay lại trang chức năng
   *
   */
  const goBack = () => {
    history.push("/danh-muc-kho-tpc/san-pham");
  };

  const formTitle = type === "new" ? "Thêm mới sản phẩm" : "Chỉnh sửa sản phẩm";

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
              label="Mã sản phẩm"
              name={["SanPham", "maSanPham"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={maSP}
            >
              <Input className="input-item" placeholder="Nhập mã sản phẩm" />
            </FormItem>
            <FormItem
              label="Tên sản phẩm"
              name={["SanPham", "tenSanPham"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
                {
                  max: 250,
                },
              ]}
              initialValue={tenSP}
            >
              <Input className="input-item" placeholder="Nhập tên sản phẩm" />
            </FormItem>
            <FormItem
              label="Loại sản phẩm"
              name={["SanPham", "loaiSanPham_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
              initialValue={loaiSanPham_Id}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={LoaiSanPhamSelect ? LoaiSanPhamSelect : []}
                placeholder="Chọn loại sản phẩm"
                optionsvalue={["id", "tenLoaiSanPham"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Kích thước"
              name={["SanPham", "kichThuoc"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Input placeholder="Nhập kích thước"></Input>
            </FormItem>
            <FormItem
              label="Màu sắc"
              name={["SanPham", "mauSac_Id"]}
              rules={[
                {
                  type: "array",
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={MauSacSelect ? MauSacSelect : []}
                placeholder="Chọn màu sắc"
                optionsvalue={["id", "tenMauSac"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
                mode={"multiple"}
              />
            </FormItem>
            <FormItem
              label="Đơn vị tính"
              name={["SanPham", "donViTinh_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={DonViTinhSelect ? DonViTinhSelect : []}
                placeholder="Chọn đơn vị tính"
                optionsvalue={["id", "tenDonViTinh"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
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

export default SanPhamForm;
