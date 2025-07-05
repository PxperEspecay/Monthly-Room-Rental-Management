const MainMenu = require('../Models/main_menu_model')

// exports.getMenu = async (req, res) => {
//     try {
//         const data = await MainMenu.findAll();
//         res.status(200).json({
//             status_code: 8000,
//             message: "Success",
//             description: "Get MainMemu Success",
//             data
  
            
//           }); // ส่งข้อมูลกลับไปที่ client ในรูปแบบ JSON
//     } catch (error) {
//         console.error('Error fetching main menu:', error);
//         res.status(500).json({ message: 'Error fetching main menu', error: error.message }); // ส่ง error กลับไปที่ client
//     }
// };

exports.getMenu = async (req, res) => {
    try {
        const userRole = req.user.role; // ดึงบทบาทผู้ใช้จาก request (เช่น 'admin', 'superadmin')
        let data;

        if (userRole === 'super admin') {
            // หากผู้ใช้เป็น superadmin ให้ดึงเมนูทั้งหมด
            data = await MainMenu.findAll();
        } else if (userRole === 'admin') {
            // หากผู้ใช้เป็น admin ให้ดึงเฉพาะเมนูที่ admin สามารถเห็นได้
            data = await MainMenu.findAll({
                where: {
                    // สมมุติว่าเรามีฟิลด์ 'admin_only' ใน main_menu สำหรับกำหนดเมนูที่ admin เห็นได้
                    admin_only: true 
                }
            });
        } else {
            // กรณีที่เป็น role อื่นๆ
            return res.status(403).json({
                status_code: 8001,
                message: "Permission Denied",
                description: "You do not have access to this menu"
            });
        }

        res.status(200).json({
            status_code: 8000,
            message: "Success",
            description: "Get MainMenu Success",
            data
        });

    } catch (error) {
        console.error('Error fetching main menu:', error);
        res.status(500).json({ 
            status_code: 6000,
            message: 'Error fetching main menu', 
            error: error.message 
        });
    }
};

