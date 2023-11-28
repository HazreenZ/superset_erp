frappe.pages['superset-integration'].on_page_load = function (wrapper) {
    // Initialize the Superset Integration tool
    const supersetIntegration = new SupersetIntegrationTool(wrapper);
    supersetIntegration.init();
};

class SupersetIntegrationTool {
    constructor(wrapper) {
        this.wrapper = wrapper;
        this.page = frappe.ui.make_app_page({
            parent: this.wrapper,
            title: 'Superset Integration',
            single_column: true
        });

        this.form = this.makeForm();
        this.dataset = this.initializeDataset();
    }

    makeForm() {
        // Create a form with a button
        const form = new frappe.ui.FieldGroup({
            fields: [
                {
                    label: __('Superset Setting'),
                    fieldname: 'superset_setting',
                    fieldtype: 'Link',
                    options: 'superset setting',
                    change: () => this.retrieveSet(),
                    get_query: () => {
                        return {
                            // Additional query parameters if needed
                        };
                    }
                },
                {
                    label: __('Confirm'),
                    fieldname: 'custom_button',
                    fieldtype: 'Button',
                    icon: 'fa fa-check',
                    click: () => this.customButtonClick(),
                }
            ],
            body: this.page.body  // Use the page reference to attach the form
        });

        form.make();
        return form;
    }

    initializeDataset() {
        return {
            supersetDomain: '',
            dashboardId: '',
            supersetUsername: '',
            supersetUserPassword: '',
            supersetFirstName: '',
            supersetLastName: '',
            supersetRls: ''
        };
    }

    init() {
        // Now that we have the tokens, show the form
        this.form.refresh();
    }

    retrieveSet() {
        const values = this.form.get_values();

        // Check if values are not undefined
        if (values) {
            const supersetSetting = values.superset_setting;

            // Use frappe.call to get the values
            frappe.call({
                method: 'frappe.client.get',
                args: {
                    doctype: 'superset setting',
                    name: supersetSetting,
                },
                callback: (response) => {
                    const values = response.message;

                    if (values) {
                        // Update the dataset based on retrieved values
                        this.dataset = {
                            supersetDomain: values.su_domain,
                            dashboardId: values.su_dashid,
                            supersetUsername: values.su_username,
                            supersetUserPassword: values.su_userpassword,
                            supersetFirstName: values.su_fname,
                            supersetLastName: values.su_lname,
                            supersetRls: values.su_rls
                        };

                        // Implement your logic to retrieve the set based on the selected Superset Setting
                    } else {
                        frappe.msgprint(__('No values to retrieve.'));
                    }
                }
            });
        } else {
            frappe.msgprint(__('Please select a Superset Setting.'));
        }
    }

    customButtonClick() {
        // Create a container div for the Superset dashboard
        const dashboardContainer = document.createElement('div');
        dashboardContainer.id = 'dashboard-container';

        // Append the dashboard container to the page wrapper
        this.wrapper.appendChild(dashboardContainer);

        try {
            // Fetch Superset access and guest tokens
            this.getAccessToken().then(async (accessToken) => {
                const guestToken = await this.createGuestToken();

                // Use the Superset Embedded SDK to embed the dashboard
                this.embedDashboard(guestToken, dashboardContainer);
            });
        } catch (error) {
            console.error('Error fetching tokens:', error);
            frappe.msgprint(__('Error connecting to Superset dashboard. Please check your Superset setting input.'));
        }
    }

    // Function to get the access token
    async getAccessToken() {
        const url = this.dataset.supersetDomain + 'api/v1/security/login';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "password": this.dataset.supersetUserPassword,
                "provider": "db",
                "refresh": true,
                "username": this.dataset.supersetUsername
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to get access token');
        }

        const data = await response.json();
        return data.access_token;
    }

    // Function to create the guest token
    async createGuestToken() {
        try {
            const csrfToken = await this.getCSRFToken();
            const url = this.dataset.supersetDomain + 'api/v1/security/guest_token/';

            const backendCredentials = btoa(`${this.dataset.supersetUsername}:${this.dataset.supersetUserPassword}`);

            const response = await fetch(url, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${backendCredentials}`,
                    'X-CSRFToken': csrfToken,
                },
                credentials: 'include',
                body: JSON.stringify({
                    "user": {
                        "username": this.dataset.supersetUsername,
                        "first_name": this.dataset.supersetFirstName,
                        "last_name": this.dataset.supersetLastName
                    },
                    "resources": [{
                        "type": "dashboard",
                        "id": this.dataset.dashboardId
                    }],
                    "rls": [
                        {
                            "clause": this.dataset.supersetRls
                        }
                    ]
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create Guest Token');
            }

            const data = await response.json();
            return data.guest_token;
        } catch (error) {
            console.error('Error creating Guest Token:', error);
            throw error;  // Re-throw the error to be caught in the calling function
        }
    }

    // Function to get the CSRF token
    async getCSRFToken() {
        const accessToken = await this.getAccessToken();
        const csrfResponse = await fetch(this.dataset.supersetDomain + 'api/v1/security/csrf_token/', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const csrfData = await csrfResponse.json();
        return csrfData.result;
    }

    // Function to embed the Superset dashboard
    embedDashboard(guestToken, container) {
        // Example: Create an iframe and set its source to the Superset dashboard URL
        const dashboardUrl = `${this.dataset.supersetDomain}superset/dashboard/${this.dataset.dashboardId}/?standalone=2&access_token=${guestToken}`;
        const iframe = document.createElement('iframe');
        iframe.src = dashboardUrl;
        iframe.style.position = 'fixed';
        iframe.style.width = '100%';
        iframe.style.height = '600px';
        iframe.style.top = '10px';
        iframe.style.marginTop = '100px';

        // Append the iframe to the specified container
        container.appendChild(iframe);
    }
}
