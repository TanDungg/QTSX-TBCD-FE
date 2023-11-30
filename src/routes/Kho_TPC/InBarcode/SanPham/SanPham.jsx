import React, { useState, useEffect } from "react";
import { Card, Form, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Input, Select, FormSubmit } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
import ContainerHeader from "src/components/ContainerHeader";
import { setLocalStorage } from "src/util/Common";
const FormItem = Form.Item;

function SanPham({ match, permission, history }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading } = useSelector(({ common }) => common).toJS();
  const [ListSanPham, setListSanPham] = useState([]);
  const [ListMauSac, setListMauSac] = useState([]);

  const [fieldTouch, setFieldTouch] = useState(false);

  const { setFieldsValue, validateFields, resetFields } = form;
  useEffect(() => {
    if (permission && !permission.view) {
      history.push("/home");
    } else {
      getSanPham();
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
          if (res.data.mauSac) {
            setListMauSac(JSON.parse(res.data.mauSac));
          } else {
            setListMauSac([]);
          }
          setFieldsValue({
            SanPham: {
              tenDonViTinh: res.data.tenDonViTinh,
              mauSac_Id: null,
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Lấy danh sách menu
   *
   */
  const getSanPham = async () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart("SanPham?page=-1", "GET", null, "LIST", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListSanPham(
            res.data.map((sp) => {
              return {
                ...sp,
                name: sp.maSanPham + " - " + sp.tenSanPham,
              };
            })
          );
        } else {
          setListSanPham([]);
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
    const newData = [];
    ListSanPham.forEach((sp) => {
      if (sp.id === values.SanPham.sanPham_Id) {
        newData.push({
          id:
            sp.id +
            (values.SanPham.mauSac_Id ? "_" + values.SanPham.mauSac_Id : ""),
          maSanPham: sp.maSanPham,
          tenSanPham: sp.tenSanPham,
        });
      }
    });
    if (values.SanPham.mauSac_Id) {
      ListMauSac.forEach((ms) => {
        if (ms.mauSac_Id === values.SanPham.mauSac_Id) {
          newData[0].tenMauSac = ms.tenMauSac;
        }
      });
    }
    setLocalStorage("inMa", newData);
    window.open(`${match.url}/inMa`, "_blank");
  };

  const formTitle = "In Barcode sản phẩm";

  return (
    <div className="gx-main-content">
      <ContainerHeader title={formTitle} />
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
              label="Sản phẩm"
              name={["SanPham", "sanPham_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListSanPham ? ListSanPham : []}
                placeholder="Chọn sản phẩm"
                optionsvalue={["id", "name"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
                onSelect={(val) => getInfo(val)}
              />
            </FormItem>
            <FormItem
              label="Đơn vị tính"
              name={["SanPham", "tenDonViTinh"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Input placeholder="Đơn vị tính" disabled={true} />
            </FormItem>
            <FormItem
              label="Màu sắc"
              name={["SanPham", "mauSac_Id"]}
              rules={[
                {
                  type: "string",
                  required: ListMauSac.length > 0,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListMauSac ? ListMauSac : []}
                placeholder="Chọn màu sắc"
                optionsvalue={["mauSac_Id", "tenMauSac"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>

            <FormSubmit content={"Tạo mã Barcode"} disabled={fieldTouch} />
          </Form>
        </Spin>
      </Card>
    </div>
  );
}

export default SanPham;
