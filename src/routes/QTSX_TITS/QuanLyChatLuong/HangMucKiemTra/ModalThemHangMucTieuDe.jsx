import { Modal as AntModal, Input, Form, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStart } from "src/appRedux/actions/Common";
import { FormSubmit } from "src/components/Common";
import { DEFAULT_FORM_CUSTOM } from "src/constants/Config";

const FormItem = Form.Item;

function ModalThemHangMucTieuDe({
  openModalFS,
  openModal,
  itemData = {},
  refesh,
}) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue, validateFields } = form;

  useEffect(() => {
    if (openModal) {
      if (itemData.type === "new") {
        resetFields();
      } else if (itemData.type === "edit") {
        resetFields();
        setFieldsValue({
          hangMucTieuDePhu: {
            ...itemData,
          },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const onFinish = (values) => {
    saveData(values.hangMucTieuDePhu);
  };

  /**
   * Lưu và thoát
   *
   */
  const saveAndClose = () => {
    validateFields()
      .then((values) => {
        saveData(values.hangMucTieuDePhu, true);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const saveData = (hangMucTieuDePhu, saveQuit = false) => {
    if (itemData.type === "new") {
      const newData = {
        ...hangMucTieuDePhu,
        tits_qtsx_HangMucKiemTra_Id: itemData.tits_qtsx_HangMucKiemTra_Id,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_HangMucKiemTra/tieu-de-phu`,
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
          if (res && res.status !== 409) {
            if (saveQuit) {
              handleCancel();
            } else {
              setFieldTouch(false);
            }
          }
        })
        .catch((error) => console.error(error));
    }
    if (itemData.type === "edit") {
      const newData = {
        ...hangMucTieuDePhu,
        id: itemData.id,
      };
      new Promise((resolve, reject) => {
        dispatch(
          fetchStart(
            `tits_qtsx_HangMucKiemTra/hang-muc-kiem-tra-tieu-de-phu/${itemData.id}`,
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
          if (res && res.status !== 409) {
            if (saveQuit) {
              handleCancel();
            } else {
              setFieldTouch(false);
            }
          }
        })
        .catch((error) => console.log(error));
    }
  };

  const handleCancel = () => {
    resetFields();
    openModalFS(false);
    refesh();
  };
  const title = (
    <span>
      {itemData.type === "new" ? "Thêm mới hạng mục  " : "Chỉnh sửa hạng mục  "}
      {itemData.tieuDePhu && (
        <Tag color={"darkcyan"} style={{ fontSize: "14px" }}>
          {itemData.tieuDePhu}
        </Tag>
      )}
    </span>
  );

  return (
    <AntModal
      title={title}
      open={openModal}
      width={width > 1000 ? `80%` : "100%"}
      closable={true}
      onCancel={handleCancel}
      footer={null}
      bodyStyle={{
        paddingBottom: 0,
      }}
    >
      <div className="gx-main-content">
        <Form
          {...DEFAULT_FORM_CUSTOM}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <FormItem
            label="Hạng mục"
            name={["hangMucTieuDePhu", "tieuDePhu"]}
            rules={[
              {
                type: "string",
                required: true,
              },
            ]}
          >
            <Input className="input-item" placeholder="Nhập hạng mục" />
          </FormItem>

          {/* <FormItem
            label="Vị trí"
            name={["hangMucTieuDePhu", "thuTuTieuDePhu"]}
            rules={[
              {
                pattern: /^[1-9]\d*$/,
                message: "Vị trí không hợp lệ!",
                required: true,
              },
            ]}
          >
            <Input className="input-item" placeholder="Nhập vị trí" />
          </FormItem> */}

          <FormSubmit
            goBack={handleCancel}
            saveAndClose={saveAndClose}
            disabled={fieldTouch}
          />
        </Form>
      </div>
    </AntModal>
  );
}

export default ModalThemHangMucTieuDe;
