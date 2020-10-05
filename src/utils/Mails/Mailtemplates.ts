import { User } from '@prisma/client'

function LoginSecret(user: User, key: number) {
  return `
  <div 
  style ="text-align: center;
  padding: 70px 0;"
  >
    <h1>Hello ${user.username}</h1>
    <h2>Welcome in iChat.</h2>
    <h3> Your Code is : <a><b style="color:red" >${key}</b></a> </h3>
  
  </div> 
  `
}

function ForgotPasswordUser(user: any, token: string) {
  return `
  <div 
  style ="text-align: center;
  padding: 70px 0;"
  >
    <h1>Hello ${user.username}</h1>
    <h2>Welcome in iCHAT.</h2>
    <div>
      <h1>Click On The Link To Reset Your Password 
      <a className="btn btn-info btn-block" 
      href='${process.env.FRONTEND_URL}/password-reset?token=${token}'>Click Here</a> </h1>
      </div>
  
  </div> 
  `
}

export { LoginSecret, ForgotPasswordUser }
