import { Component } from "react"

class form extends Component {
    render() {
        return(
            <div className = "flex justify-center">
                 <div className = "w-1/2 flex flex-col pb-12">
                    <form action = "mailto:mimerderal@gmail.com" method="POST" encType="multipart/form-data"
                    name="EmailForm">
                        <input type="text"
                            className="form-control mb-1"
                            placeholder='Message' />

                        <input type="submit"
                            className='bbtn btn-block btn-danger btn-sm'
                            value="Send email" />
                    </form>
                </div>
            </div>
        )
    }
} 
export default form
