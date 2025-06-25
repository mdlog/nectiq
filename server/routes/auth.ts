import { Request, Response } from 'express';

export const logout = async (req: Request, res: Response) => {
  try {
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to logout' 
        });
      }
      
      // Clear session cookie
      res.clearCookie('connect.sid');
      
      res.json({ 
        success: true, 
        message: 'Logged out successfully' 
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during logout' 
    });
  }
};