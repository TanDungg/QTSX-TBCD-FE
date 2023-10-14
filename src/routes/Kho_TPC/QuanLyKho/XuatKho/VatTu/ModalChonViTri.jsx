import { Modal as AntModal, Form, Card, Input, Button, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DEFAULT_FORM_MODAL } from "src/constants/Config";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import { Select } from "src/components/Common";
const FormItem = Form.Item;
const initialState = {
  maPhieu: "",
  lyDoTuChoi: "",
};
function ModalChonViTri({
  openModalFS,
  openModal,
  itemData,
  refesh,
  ThemViTri,
}) {
  const { width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue, validateFields } = form;
  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListViTriKho, setListViTriKho] = useState([]);
  const [ViTri, setViTri] = useState([]);

  useEffect(() => {
    if (openModal) {
      getListViTriKho(itemData.cauTrucKhoId, itemData.vatTu_Id);
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListViTriKho = (cauTrucKho_Id, vatTu_Id) => {
    const params = convertObjectToUrlParams({
      cauTrucKho_Id,
      vatTu_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_ViTriLuuKho/list-vi-tri-vat-tu-trong-kho?${params}`,
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
        const newData = res.data.map((data) => {
          return {
            ...data,
            viTri: `${data.tenKe}${data.tenTang ? ` - ${data.tenTang}` : ""}${
              data.tenNgan ? ` - ${data.tenNgan}` : ""
            } (HSD: ${data.thoiGianSuDung})`,
          };
        });
        setListViTriKho(newData);
      } else {
        setListViTriKho([]);
      }
    });
  };

  const XacNhanViTri = () => {
    ThemViTri(ViTri);
    openModalFS(false);
    resetFields();
  };

  const OnSelectViTri = (value) => {
    const newData = ListViTriKho.filter((d) => d.chiTietKho_Id === value);
    setViTri(newData[0]);
    setFieldsValue({
      modalchonvitri: {
        soLuong: newData[0].soLuong,
      },
    });
  };

  const handleCancel = () => {
    openModalFS(false);
    refesh();
  };

  const Title = (
    <span>Chọn vị trí xuất kho của vật tư - {itemData.tenVatTu}</span>
  );

  return (
    <AntModal
      title={Title}
      open={openModal}
      width={width > 1000 ? `50%` : "80%"}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Card className="th-card-margin-bottom">
          <Form
            {...DEFAULT_FORM_MODAL}
            form={form}
            name="nguoi-dung-control"
            onFieldsChange={() => setFieldTouch(true)}
          >
            <FormItem
              label="Chọn vị trí kho"
              name={["modalchonvitri", "chiTietViTri_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListViTriKho ? ListViTriKho : []}
                placeholder="Chọn vị trí xuất kho"
                optionsvalue={["chiTietKho_Id", "viTri"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp={"name"}
                onSelect={OnSelectViTri}
                allowClear
              />
            </FormItem>
            <FormItem
              label="Lý do"
              name={["modalchonvitri", "soLuong"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Input
                className="input-item"
                placeholder="Số lượng của vật tư tại vị trí kho"
                disabled
              />
            </FormItem>
          </Form>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              className="th-btn-margin-bottom-0"
              type="primary"
              onClick={XacNhanViTri}
              disabled={!fieldTouch}
            >
              Xác nhận
            </Button>
          </div>
        </Card>
      </div>
    </AntModal>
  );
}

export default ModalChonViTri;
