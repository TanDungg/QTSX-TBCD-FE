import {
  Modal as AntModal,
  Button,
  Row,
  Form,
  Input,
  Col,
  Checkbox,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams } from "src/util/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";
const FormItem = Form.Item;

function ModalHangMuc({
  openModalFS,
  openModal,
  DataModal,
  setListHangMuc,
  listHangMuc,
}) {
  const dispatch = useDispatch();

  const [fieldTouch, setFieldTouch] = useState(false);
  const [ListHangMucKiemTra, setListHangMucKiemTra] = useState([]);
  const [CheckBox, setCheckBox] = useState([]);

  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;

  useEffect(() => {
    if (openModal) {
      if (listHangMuc.length > 0) {
        setCheckBox(listHangMuc.map((hm) => hm.tits_qtsx_HangMucKiemTra_Id));
      }
      setFieldsValue({
        hangMucKiemTra: {
          sanPham: DataModal.tenSanPham,
          congDoan: DataModal.tenCongDoan,
        },
      });
      getHangMucKiemTra(DataModal);
    }
  }, [openModal]);

  const getHangMucKiemTra = (DataModal) => {
    const params = convertObjectToUrlParams({
      tits_qtsx_CongDoan_Id: DataModal.tits_qtsx_CongDoan_Id,
      tits_qtsx_LoaiSanPham_Id: DataModal.tits_qtsx_LoaiSanPham_Id,
      tits_qtsx_SanPham_Id: DataModal.tits_qtsx_SanPham_Id,
      page: -1,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_HangMucKiemTra?${params}`,
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
          setListHangMucKiemTra(res.data);
        } else {
          setListHangMucKiemTra([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const saveData = (vattu) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_HangMucKiemTra/list-hang-muc-kiem-tra-theo-list-id`,
          "POST",
          CheckBox,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status !== 409) {
          setListHangMuc(res.data);
          resetFields();

          openModalFS(false);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleCancel = () => {
    openModalFS(false);
  };
  /**
   * Khi submit
   *
   * @param {*} values
   */
  const onFinish = (values) => {
    saveData();
  };

  return (
    <AntModal
      title={"Danh sách hạng mục kiểm tra"}
      open={openModal}
      width={`70%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="gx-main-content">
        <Form
          {...DEFAULT_FORM_CUSTOM}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <FormItem label="Sản phẩm" name={["hangMucKiemTra", "sanPham"]}>
            <Input disabled={true}></Input>
          </FormItem>
          <FormItem label="Công đoạn" name={["hangMucKiemTra", "congDoan"]}>
            <Input disabled={true}></Input>
          </FormItem>
          <FormItem
            label=" Nhóm hạng mục kiểm tra"
            name={["hangMucKiemTra", "hangMucKiemTra"]}
          >
            <Row style={{ width: "100%" }}>
              <Checkbox.Group
                value={CheckBox}
                onChange={(checkedValues) => {
                  setCheckBox(checkedValues);
                }}
              >
                {ListHangMucKiemTra.map((hm) => {
                  return (
                    <Col span={24} style={{ marginBottom: 5 }}>
                      <Checkbox value={hm.tits_qtsx_HangMucKiemTra_Id}>
                        {hm.tenHangMucKiemTra}
                      </Checkbox>
                    </Col>
                  );
                })}
              </Checkbox.Group>
            </Row>
          </FormItem>

          <Row justify={"center"}>
            <Button
              className="th-margin-bottom-0"
              style={{ marginTop: 10, marginRight: 15 }}
              type="primary"
              htmlType="submit"
              disabled={!fieldTouch}
            >
              Lưu
            </Button>
          </Row>
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalHangMuc;
